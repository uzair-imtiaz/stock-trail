const Purchase = require('../models/purchase.model');
const Account = require('../models/account.model');
const mongoose = require('mongoose');
const Inventory = require('../models/inventory.model');
const inventoryService = require('../services/inventory.services');

const createPurchase = async (req, res) => {
  try {
    const {
      items,
      bank,
      vendor,
      totalDeductions = [],
      purchaseDeliveryNumber,
      dispatchDate = new Date(),
      orderDate = new Date(),
    } = req.body;

    let totalPurchaseAmount = items.reduce((acc, item) => acc + item.total, 0);
    const sanitizedDeductions = totalDeductions.filter(
      (deduction) => deduction?.amount
    );

    if (sanitizedDeductions?.length > 0) {
      sanitizedDeductions.forEach((deduction) => {
        const deductionAmount = deduction.isPercentage
          ? (totalPurchaseAmount * (deduction?.amount || 0)) / 100
          : deduction?.amount || 0;
        totalPurchaseAmount -= deductionAmount;
      });
    }

    const purchase = await Purchase.create({
      items,
      bank,
      vendor,
      totalDeductions: sanitizedDeductions,
      purchaseDeliveryNumber,
      total: totalPurchaseAmount || 0,
      dispatchDate,
      orderDate,
      tenant: req.tenantId,
    });

    if (!purchase) {
      return res
        .status(400)
        .json({ success: false, message: 'Unable to create purchase' });
    }

    // 4️⃣ Check & Deduct from Bank Account
    const bankAccount = await Account.findOne({
      _id: bank,
      tenant: req.tenantId,
    });
    if (!bankAccount) {
      return res
        .status(404)
        .json({ success: false, message: 'Bank account not found' });
    }

    if (bankAccount.balance < totalPurchaseAmount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance in bank account',
      });
    }

    bankAccount.balance -= totalPurchaseAmount;
    await bankAccount.save();

    // 5️⃣ Update Inventory Quantities
    for (const item of items) {
      const inventoryItem = await Inventory.findOne({
        _id: item.itemId,
        tenant: req.tenantId,
      });

      if (!inventoryItem) {
        return res
          .status(400)
          .json({ success: false, message: `Item not found in inventory` });
      }

      inventoryItem.quantity += item.quantity;
      await inventoryItem.save();
    }

    return res.status(201).json({
      success: true,
      message: 'Purchase created successfully',
      data: purchase,
    });
  } catch (error) {
    console.log('error', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

// Needs to be looked at
const getPurchaseReport = async (req, res) => {
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
          purchaseDeliveryNumber: 1,
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
        };
      })
      .filter((item) => item !== null),
  }));
};

module.exports = {
  createPurchase,
  getPurchaseReport,
};
