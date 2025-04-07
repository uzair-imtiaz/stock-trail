const { default: mongoose } = require('mongoose');
const Inventory = require('../models/inventory.model');

const inventoryService = {
  async getGroupedInventory(tenant) {
    const tenantObjectId = new mongoose.Types.ObjectId(tenant);
    try {
      const inventory = await Inventory.aggregate([
        {
          $match: {
            tenant: tenantObjectId,
          },
        },
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
            unitPrice: 1,
            salePrice: 1,
            category: 1,
            grammage: 1,
            location: 1,
          },
        },
      ]);

      return inventory;
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error fetching inventory',
      };
    }
  },
};

module.exports = inventoryService;
