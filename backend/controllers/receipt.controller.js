const mongoose = require('mongoose');
const Receipt = require('../models/receipt.model');
const RouteActivity = require('../models/routeActivity.model');
const Account = require('../models/account.model');
const OtherAccount = require('../models/otherAccount.model');

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

const sanitizeOtherAccountEntries = async (entries = [], tenantId, session) => {
  if (!Array.isArray(entries) || entries.length === 0) {
    return [];
  }

  const sanitized = [];
  const accountIdSet = new Set();

  entries.forEach((entry, index) => {
    const rawId =
      entry?.otherAccount || entry?.otherAccountId || entry?._id || entry?.id;

    if (!rawId || !mongoose.Types.ObjectId.isValid(rawId)) {
      const err = new Error(
        `Invalid other account reference at position ${index + 1}`
      );
      err.statusCode = 400;
      throw err;
    }

    const amount = Number(entry?.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      const err = new Error(
        `Amount must be a positive number at position ${index + 1}`
      );
      err.statusCode = 400;
      throw err;
    }

    const normalizedId = rawId.toString();
    sanitized.push({ otherAccount: normalizedId, amount });
    accountIdSet.add(normalizedId);
  });

  const query = OtherAccount.find({
    _id: { $in: Array.from(accountIdSet) },
    tenant: tenantId,
  }).select('_id');

  if (session) {
    query.session(session);
  }

  const accounts = await query.exec();

  if (accounts.length !== accountIdSet.size) {
    const err = new Error('One or more other accounts could not be found');
    err.statusCode = 404;
    throw err;
  }

  return sanitized;
};

const buildAmountMap = (entries = []) => {
  const map = new Map();
  entries.forEach((entry) => {
    if (!entry || !entry.otherAccount) return;
    const key = entry.otherAccount.toString();
    const amount = Number(entry.amount) || 0;
    if (amount <= 0) return;
    map.set(key, (map.get(key) || 0) + amount);
  });
  return map;
};

const calculateDeltaMap = (previousEntries = [], nextEntries = []) => {
  const previousMap = buildAmountMap(previousEntries);
  const nextMap = buildAmountMap(nextEntries);
  const deltaMap = new Map();

  nextMap.forEach((value, key) => {
    deltaMap.set(key, (deltaMap.get(key) || 0) + value);
  });

  previousMap.forEach((value, key) => {
    deltaMap.set(key, (deltaMap.get(key) || 0) - value);
  });

  return deltaMap;
};

const applyOtherAccountAdjustments = async (
  creditDeltaMap,
  debitDeltaMap,
  tenantId,
  session
) => {
  const accountIds = new Set([
    ...creditDeltaMap.keys(),
    ...debitDeltaMap.keys(),
  ]);

  for (const accountId of accountIds) {
    const creditDelta = creditDeltaMap.get(accountId) || 0;
    const debitDelta = debitDeltaMap.get(accountId) || 0;
    const netChange = creditDelta - debitDelta;

    if (netChange === 0) continue;

    const updateOptions = { new: true };
    if (session) {
      updateOptions.session = session;
    }

    const updatedAccount = await OtherAccount.findOneAndUpdate(
      { _id: accountId, tenant: tenantId },
      { $inc: { balance: netChange } },
      updateOptions
    );

    if (!updatedAccount) {
      throw new Error('Unable to update other account balance');
    }
  }
};

const createOrUpdateReceipt = async (req, res) => {
  try {
    const {
      account,
      saleId,
      credits = [],
      returnedCredits = [],
      advances = [],
      otherCredits: incomingOtherCredits = [],
      otherDebits: incomingOtherDebits = [],
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
    await sale.save();

    const sanitizedOtherCredits = await sanitizeOtherAccountEntries(
      incomingOtherCredits,
      req.tenantId
    );
    const sanitizedOtherDebits = await sanitizeOtherAccountEntries(
      incomingOtherDebits,
      req.tenantId
    );

    let receipt = await Receipt.findOne({
      saleId,
      tenant: req.tenantId,
    });
    let previousAmountRecovered = 0;
    let previousOtherCredits = [];
    let previousOtherDebits = [];

    if (receipt) {
      previousAmountRecovered = receipt.credits.reduce(
        (sum, item) => sum + (item.creditAmount - item.returnedAmount),
        0
      );

      previousOtherCredits = receipt.otherCredits
        ? receipt.otherCredits.map((entry) => ({
            otherAccount: entry.otherAccount,
            amount: entry.amount,
          }))
        : [];
      previousOtherDebits = receipt.otherDebits
        ? receipt.otherDebits.map((entry) => ({
            otherAccount: entry.otherAccount,
            amount: entry.amount,
          }))
        : [];

      receipt.credits = mergeCreditData(
        receipt.credits,
        credits,
        returnedCredits
      );

      receipt.advances.push(...advances);
      receipt.otherCredits = sanitizedOtherCredits;
      receipt.otherDebits = sanitizedOtherDebits;

      await receipt.save();
    } else {
      receipt = await Receipt.create({
        account,
        saleId,
        credits: mergeCreditData([], credits, returnedCredits),
        advances,
        otherCredits: sanitizedOtherCredits,
        otherDebits: sanitizedOtherDebits,
        tenant: req.tenantId,
      });

      if (!receipt) {
        return res
          .status(400)
          .json({ success: false, message: 'Unable to create receipt' });
      }
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

    const creditDeltaMap = calculateDeltaMap(
      previousOtherCredits,
      sanitizedOtherCredits
    );
    const debitDeltaMap = calculateDeltaMap(
      previousOtherDebits,
      sanitizedOtherDebits
    );

    await applyOtherAccountAdjustments(
      creditDeltaMap,
      debitDeltaMap,
      req.tenantId
    );

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
    await backAccount.save();

    res.status(201).json({
      success: true,
      data: receipt,
      message: 'Receipt updated successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const getReceipts = async (req, res) => {
  try {
    const receipts = await Receipt.find({ tenant: req.tenantId })
      .populate({
        path: 'saleId',
        select: 'profit expenses totalAmount salesman',
        populate: {
          path: 'salesman',
          select: 'name',
        },
      })
      .populate({
        path: 'otherCredits.otherAccount',
        select: 'otherAccountId name category balance',
      })
      .populate({
        path: 'otherDebits.otherAccount',
        select: 'otherAccountId name category balance',
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
    })
      .populate({
        path: 'credits.shopId',
        select: 'name',
      })
      .populate({
        path: 'otherCredits.otherAccount',
        select: 'otherAccountId name category balance',
      })
      .populate({
        path: 'otherDebits.otherAccount',
        select: 'otherAccountId name category balance',
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
