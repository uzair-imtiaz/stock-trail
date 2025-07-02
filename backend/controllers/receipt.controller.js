const mongoose = require('mongoose');
const Receipt = require('../models/receipt.model');
const RouteActivity = require('../models/routeActivity.model');
const Account = require('../models/account.model');

const mergeCreditData = (
  existingCredits,
  newCredits = [],
  returnedCredits = []
) => {
  if (
    !Array.isArray(existingCredits) ||
    !Array.isArray(newCredits) ||
    !Array.isArray(returnedCredits)
  ) {
    throw new Error(
      'Existing credits, newCredits, and returnedCredits must be arrays'
    );
  }

  const mergedData = [...existingCredits];

  newCredits.forEach(({ description: shopId, amount }) => {
    if (amount > 0) {
      mergedData.push({
        shopId,
        creditAmount: Math.max(0, amount),
        returnedAmount: 0,
      });
    }
  });

  returnedCredits.forEach(({ description: shopId, amount }) => {
    if (amount > 0) {
      mergedData.push({
        shopId,
        creditAmount: 0,
        returnedAmount: Math.max(0, amount),
      });
    }
  });

  return mergedData;
};

const createOrUpdateReceipt = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      account,
      saleId,
      credits = [],
      returnedCredits = [],
      advances = [],
    } = req.body;

    const backAccount = await Account.findOne({
      _id: account,
      tenant: req.tenantId,
    });
    if (!backAccount) {
      return res
        .status(404)
        .json({ success: false, message: 'Account not found' });
    }

    const sale = await RouteActivity.findOne({
      _id: saleId,
      tenant: req.tenantId,
    });
    if (!sale) {
      return res
        .status(404)
        .json({ success: false, message: 'Sale not found' });
    }

    sale.hasReceipt = true;
    await sale.save({ session });

    let receipt = await Receipt.findOne({
      saleId,
      tenant: req.tenantId,
    }).session(session);
    let previousAmountRecovered = 0;

    if (receipt) {
      previousAmountRecovered = receipt.credits.reduce(
        (sum, item) => sum + (item.creditAmount - item.returnedAmount),
        0
      );

      receipt.credits = mergeCreditData(
        receipt.credits,
        credits,
        returnedCredits
      );

      receipt.advances.push(...advances);

      await receipt.save({ session });
    } else {
      receipt = await Receipt.create(
        [
          {
            account,
            saleId,
            credits: mergeCreditData([], credits, returnedCredits),
            advances,
            tenant: req.tenantId,
          },
        ],
        { session }
      );

      if (!receipt || receipt.length === 0) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .json({ success: false, message: 'Unable to create receipt' });
      }
      receipt = receipt[0];
    }

    const totalCreditAmount = receipt.credits.reduce(
      (sum, item) => sum + item.creditAmount,
      0
    );
    const totalReturnedAmount = receipt.credits.reduce(
      (sum, item) => sum + item.returnedAmount,
      0
    );
    const amountRecovered = totalCreditAmount - totalReturnedAmount;

    // if (totalCreditAmount > sale.profit) {
    //   await session.abortTransaction();
    //   session.endSession();
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Total credit amount cannot exceed profit amount',
    //   });
    // }

    // if (totalReturnedAmount > totalCreditAmount) {
    //   await session.abortTransaction();
    //   session.endSession();
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Total returned amount cannot exceed total credit amount',
    //   });
    // }

    const balanceAdjustment = amountRecovered - previousAmountRecovered;
    backAccount.balance += balanceAdjustment;
    await backAccount.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      data: receipt,
      message: 'Receipt updated successfully',
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const getReceipts = async (req, res) => {
  try {
    const receipts = await Receipt.find({ tenant: req.tenantId })
      .populate({
        path: 'saleId',
        select: 'profit expenses totalAmount',
      })
      .sort({ createdAt: -1 });
    if (!receipts) {
      return res
        .status(400)
        .json({ success: false, message: 'Unable to fetch receipts' });
    }
    res.status(200).json({
      success: true,
      message: 'Receipts fetched successfully',
      data: receipts,
    });
  } catch {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const getReceipt = async (req, res) => {
  try {
    const { id: saleId } = req.params;

    if (!saleId) {
      return res.status(400).json({
        success: false,
        message: 'Sale ID is required',
      });
    }

    const receipt = await Receipt.findOne({
      saleId,
      tenant: req.tenantId,
    }).populate({
      path: 'credits.shopId',
      select: 'name',
    });

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found',
      });
    }

    res.status(200).json({
      success: true,
      data: receipt,
      message: 'Receipt fetched successfully',
    });
  } catch (error) {
    console.log('error', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const generateCreditReport = async (req, res) => {
  try {
    const { salesmanId, routeId, shopId } = req.query;
    const matchStage = { tenant: new mongoose.Types.ObjectId(req.tenantId) };

    if (shopId) {
      matchStage['credits.shopId'] = mongoose.ObjectId.createFromTime(shopId);
    }

    const pipeline = [
      { $unwind: '$credits' },

      {
        $lookup: {
          from: 'shops',
          localField: 'credits.shopId',
          foreignField: '_id',
          as: 'shopDetails',
        },
      },
      { $unwind: '$shopDetails' },

      {
        $lookup: {
          from: 'routeactivities',
          localField: 'saleId',
          foreignField: '_id',
          as: 'saleDetails',
        },
      },
      { $unwind: '$saleDetails' },

      ...(salesmanId
        ? [
            {
              $match: {
                'saleDetails.salesman':
                  mongoose.ObjectId.createFromTime(salesmanId),
              },
            },
          ]
        : []),
      ...(routeId
        ? [
            {
              $match: {
                'saleDetails.routeId':
                  mongoose.ObjectId.createFromTime(routeId),
              },
            },
          ]
        : []),

      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: '%Y-%m-%d', date: '$credits.createdAt' },
            },
            shopName: '$shopDetails.name',
          },
          totalCredit: { $sum: '$credits.creditAmount' },
          totalReturned: { $sum: '$credits.returnedAmount' },
        },
      },

      { $sort: { '_id.date': -1 } },
    ];

    const report = await Receipt.aggregate(pipeline);
    if (!report) {
      return res
        .status(400)
        .json({ success: false, message: 'Report could not be generated' });
    }
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = {
  createOrUpdateReceipt,
  getReceipts,
  getReceipt,
  generateCreditReport,
};
