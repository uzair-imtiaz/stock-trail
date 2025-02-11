import { randomUUID } from 'crypto';
import Inventory from '../models/inventory.model.js';
import { asyncHandler } from '../utils/error.util.js';

export const getInventory = async (req, res) => {
  const inventory = await Inventory.find();
  if (!inventory) {
    res.status(400).json({
      success: false,
      message: 'Failed to fetch inventory',
    });
  }
  res.status(200).json({
    success: true,
    data: inventory,
    message: 'Inventory fetched successfully',
  });
};

// export const createInventory = async (req, res) => {
//   const data = req.body;

//   if (data.stockType === 'Pieces') {
//     if (!data.piecesPerCarton || data.piecesPerCarton <= 0) {
//       return res
//         .status(400)
//         .json({ success: false, message: 'Invalid piecesPerCarton value' });
//     }
//     data.quantity = data.quantity / 10;
//   }

//   const existingItem = await Inventory.findOne({
//     product: { $regex: new RegExp(`^${data.product.trim()}$`, 'i') },
//     flavor: { $regex: new RegExp(`^${data.flavor.trim()}$`, 'i') },
//     grammage: data.grammage,
//   });

//   if (existingItem) {
//     const newQuantity = existingItem.quantity + data.quantity;

//     const newUnitPrice =
//       (existingItem.quantity * existingItem.unitPrice +
//         data.quantity * data.unitPrice) /
//       newQuantity;

//     const updatedItem = await Inventory.findByIdAndUpdate(
//       existingItem._id,
//       {
//         quantity: newQuantity,
//         unitPrice: newUnitPrice,
//       },
//       { new: true }
//     );

//     return res.status(200).json({
//       success: true,
//       message: 'Inventory updated successfully',
//       data: updatedItem,
//     });
//   }

//   const newItem = await Inventory.create({
//     ...data,
//     product: data.product.trim(),
//     flavor: data.flavor.trim(),
//   });

//   if (!newItem) {
//     return res.status(400).json({
//       success: false,
//       message: 'Unable to add item to the inventory.',
//     });
//   }

//   return res.status(201).json({
//     success: true,
//     message: 'Item added successfully',
//     data: newItem,
//   });
// };

export const createInventory = async (req, res) => {
  let data = req.body;

  const existingItem = await Inventory.findOne({
    product: new RegExp(`^${data.product.trim()}$`, 'i'),
    flavor: new RegExp(`^${data.flavor.trim()}$`, 'i'),
    grammage: data.grammage,
  });

  if (existingItem) {
    let newQuantity;
    let newUnitPrice;

    // If existing item is in pieces, keep the unit in pieces
    if (existingItem.stockType === 'Pieces') {
      if (data.stockType === 'Cartons') {
        // Convert cartons to pieces before updating
        data.quantity = data.quantity * existingItem.piecesPerCarton;
      }

      newQuantity = existingItem.quantity + data.quantity;
      newUnitPrice =
        (existingItem.quantity * existingItem.unitPrice +
          data.quantity * data.unitPrice) /
        newQuantity;
    } else {
      // If existing item is in cartons, keep it in cartons
      if (data.stockType === 'Pieces') {
        // Convert pieces to cartons before updating
        data.quantity = data.quantity / 10;
      }

      newQuantity = existingItem.quantity + data.quantity;
      newUnitPrice =
        (existingItem.quantity * existingItem.unitPrice +
          data.quantity * data.unitPrice) /
        newQuantity;
    }

    const updatedItem = await Inventory.findByIdAndUpdate(
      existingItem._id,
      { quantity: newQuantity, unitPrice: newUnitPrice },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Inventory updated successfully',
      data: updatedItem,
    });
  }

  const newItem = await Inventory.create({
    ...data,
    product: data.product.trim(),
    flavor: data.flavor.trim(),
  });

  if (!newItem) {
    return res.status(400).json({
      success: false,
      message: 'Unable to add item to the inventory.',
    });
  }

  return res.status(201).json({
    success: true,
    message: 'Item added successfully',
    data: newItem,
  });
};

export const updateInventory = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const item = await Inventory.findByIdAndUpdate(id, data, { new: true });
  if (!item) {
    res.status(404).json({
      success: false,
      message: 'Failed to update item',
    });
  }
  res.status(200).json({
    success: true,
    data: item,
    message: 'Item updated successfully',
  });
};

export const deleteInventory = async (req, res) => {
  const { id } = req.params;
  const item = await Inventory.findByIdAndDelete(id);
  if (!item) {
    res.status(404).json({
      success: false,
      message: 'Failed to delete item',
    });
  }
  res.status(200).json({
    success: true,
    message: 'Item deleted successfully',
  });
};

export const getGroupedInventory = asyncHandler(async (req, res) => {
  const inventory = await Inventory.aggregate([
    {
      $sort: {
        category: 1,
        product: 1,
      },
    },

    {
      $project: {
        _id: 1,
        product: 1,
        quantity: 1,
        category: 1,
        grammage: 1,
      },
    },
  ]);

  if (!inventory) {
    return res.status(404).json({
      success: false,
      message: 'Inventory not found',
    });
  }

  res.status(200).json({
    success: true,
    data: inventory,
    message: 'Inventory fetched successfully',
  });
});
