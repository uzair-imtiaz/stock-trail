import Inventory from '../models/inventory.model.js';

const inventoryService = {
  async getGroupedInventory() {
    try {
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
            unitPrice: 1,
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

export default inventoryService;
