import Purchase from '../models/purchase.model.js';
import Account from '../models/account.model.js';
import mongoose from 'mongoose';
import Inventory from '../models/inventory.model.js';
import inventoryService from '../services/inventory.services.js';

export const createPurchase = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, bank, vendor } = req.body;

    const purchase = await Purchase.create([{ items, bank, vendor }], {
      session,
    });

    if (!purchase) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, message: 'Unable to create purchase' });
    }

    const bankAccount = await Account.findById(bank).session(session);
    if (!bankAccount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Bank account not found',
      });
    }
    const total = items.reduce((acc, item) => acc + item.total, 0);
    if (bankAccount.balance < total) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance in bank account',
      });
    }

    bankAccount.balance -= total;
    await bankAccount.save({ session });

    for (const item of items) {
      const inventoryItem = await Inventory.findOne({
        _id: item.itemId,
      }).session(session);

      if (!inventoryItem) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Item not found in inventory`,
        });
      }

      inventoryItem.quantity += item.quantity;
      await inventoryItem.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: 'Purchase created successfully',
      data: purchase,
    });
  } catch (error) {
    console.log('error', error);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

export const getPurchaseReport = async (req, res) => {
  try {
    const { startDate, endDate, vendor } = req.query;

    const matchStage = {};
    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    if (vendor) {
      matchStage.vendor = { $regex: new RegExp(vendor, 'i') };
    }

    const pipeline = [
      { $match: matchStage },

      {
        $lookup: {
          from: 'inventories',
          localField: 'items.itemId',
          foreignField: '_id',
          as: 'inventoryDetails',
        },
      },

      {
        $lookup: {
          from: 'banks',
          localField: 'bank',
          foreignField: '_id',
          as: 'bankDetails',
        },
      },
      { $unwind: '$bankDetails' },

      {
        $project: {
          _id: 1,
          purchaseId: 1,
          vendor: 1,
          createdAt: 1,
          bank: '$bankDetails.name',
          items: 1,
          inventoryDetails: 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ];

    const purchases = await Purchase.aggregate(pipeline);
    const groupedInventory = await inventoryService.getGroupedInventory();

    const report = transformInventoryData(purchases, groupedInventory);

    if (!report) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch purchase report',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Purchase report fetched successfully',
      data: report,
    });
  } catch (error) {
    console.error('Error fetching purchase report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

const transformInventoryData = (report, inventoryItem) => {
  const inventoryMap = new Map(
    inventoryItem.map((item) => [item._id.toString(), item])
  );

  return report.map((entry) => ({
    ...entry,
    inventoryDropped: entry.inventoryDropped
      .map((item) => {
        const inventoryItem = inventoryMap.get(item.itemId.toString());

        if (!inventoryItem) return null;

        return {
          _id: item.itemId,
          product: inventoryItem.product,
          grammage: inventoryItem.grammage,
          category: inventoryItem.category,
          location: inventoryItem.location,
          unitPrice: inventoryItem.unitPrice,
          quantity: item.quantityDropped,
          tpr: item.tpr,
          wastage: item.wastage,
        };
      })
      .filter((item) => item !== null),
  }));
};
