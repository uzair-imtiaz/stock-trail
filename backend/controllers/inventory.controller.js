import Inventory from '../models/inventory.model.js';

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

export const createInventory = async (req, res) => {
  const data = req.body;
  const item = await Inventory.create(data);
  if (!item) {
    res.status(400).json({
      success: false,
      message: 'Unable to add item to the inventory.',
    });
  }
  res.status(201).json({
    success: true,
    message: 'Item added successfully',
    data: item,
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
