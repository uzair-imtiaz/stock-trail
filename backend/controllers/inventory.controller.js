const Inventory = require('../models/inventory.model');
const inventoryService = require('../services/inventory.services');
const { asyncHandler } = require('../utils/error.util');

const getInventory = async (req, res) => {
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

const createInventory = async (req, res) => {
  let data = req.body;
  if (data.stockType === 'Pieces') {
    data.quantity = data.quantity / data.piecesPerCarton;
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

const updateInventory = async (req, res) => {
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

const deleteInventory = async (req, res) => {
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

const getGroupedInventory = asyncHandler(async (_, res) => {
  const inventory = await inventoryService.getGroupedInventory();
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

const transferStock = asyncHandler(async (req, res) => {
  const { id, quantity, from, to } = req.body;
  const inventoryItem = await Inventory.findById(id);

  if (!inventoryItem) {
    return res.status(404).json({
      success: false,
      message: 'Inventory item not found',
    });
  }

  if (inventoryItem.location !== from) {
    return res.status(400).json({
      success: false,
      message: `Item is not located in ${from}`,
    });
  }

  if (inventoryItem.quantity < quantity) {
    return res.status(400).json({
      success: false,
      message: `Not enough stock to transfer. Available: ${inventoryItem.quantity}`,
    });
  }

  inventoryItem.quantity -= quantity;
  await inventoryItem.save();

  const {
    _id,
    quantity: oldQuantity,
    location,
    ...newItem
  } = inventoryItem.toObject();

  const transferredInventoryItem = new Inventory({
    ...newItem,
    location: to,
    quantity,
  });

  await transferredInventoryItem.save();

  res.status(200).json({
    success: true,
    message: `Stock successfully transferred to ${to} location.`,
    data: transferredInventoryItem,
  });
});

module.exports = {
  getInventory,
  createInventory,
  updateInventory,
  deleteInventory,
  getGroupedInventory,
  transferStock
}