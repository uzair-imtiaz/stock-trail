import mongoose from 'mongoose';
import Receipt from '../models/receipt.model.js';
import RouteActivity from '../models/routeActivity.model.js';
import Account from '../models/account.model.js';

const mergeCreditData = (creditData = [], returnedCredits = []) => {
  if (!Array.isArray(creditData) || !Array.isArray(returnedCredits)) {
    throw new Error('Both creditData and returnedCredits must be arrays');
  }

  const mergedData = new Map();

  creditData.forEach(({ description: shopId, amount }) => {
    if (mergedData.has(shopId)) {
      mergedData.get(shopId).creditAmount += Math.max(0, amount);
    } else {
      mergedData.set(shopId, {
        shopId,
        creditAmount: Math.max(0, amount),
        returnedAmount: 0,
      });
    }
  });

  returnedCredits.forEach(({ description: shopId, amount }) => {
    if (mergedData.has(shopId)) {
      mergedData.get(shopId).returnedAmount += Math.max(0, amount);
    } else {
      mergedData.set(shopId, {
        shopId,
        creditAmount: 0,
        returnedAmount: Math.max(0, amount),
      });
    }
  });

  return Array.from(mergedData.values());
};

export const createOrUpdateReceipt = async (req, res) => {
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

    const backAccount = await Account.findById(account);
    if (!backAccount) {
      return res
        .status(404)
        .json({ success: false, message: 'Account not found' });
    }

    const sale = await RouteActivity.findById(saleId);
    if (!sale) {
      return res
        .status(404)
        .json({ success: false, message: 'Sale not found' });
    }

    const _credits = mergeCreditData(credits, returnedCredits);
    const totalCreditAmount = _credits.reduce(
      (sum, item) => sum + item.creditAmount,
      0
    );
    const totalReturnedAmount = _credits.reduce(
      (sum, item) => sum + item.returnedAmount,
      0
    );

    if (totalCreditAmount > sale.profit) {
      return res.status(400).json({
        success: false,
        message: 'Total credit amount cannot exceed profit amount',
      });
    }

    if (totalReturnedAmount > totalCreditAmount) {
      return res.status(400).json({
        success: false,
        message: 'Total returned amount cannot exceed total credit amount',
      });
    }

    const amountRecovered = totalCreditAmount - totalReturnedAmount;

    let receipt = await Receipt.findOne({ saleId }).session(session);
    let isNewReceipt = false;
    let previousAmountRecovered = 0;

    if (receipt) {
      previousAmountRecovered = receipt.credits.reduce(
        (sum, item) => sum + (item.creditAmount - item.returnedAmount),
        0
      );

      receipt.credits = _credits;
      receipt.advances = advances;
      await receipt.save({ session });
    } else {
      isNewReceipt = true;
      receipt = await Receipt.create(
        [{ account, saleId, credits: _credits, advances }],
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

    const balanceAdjustment =
      amountRecovered - (isNewReceipt ? 0 : previousAmountRecovered);
    backAccount.balance += balanceAdjustment;
    await backAccount.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      data: receipt,
      message: 'Receipt created successfully',
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const getReceipts = async (req, res) => {
  try {
    const receipts = await Receipt.find()
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

export const getReceipt = async (req, res) => {
  try {
    const { saleId } = req.params;

    if (!saleId) {
      return res.status(400).json({
        success: false,
        message: 'Sale ID is required',
      });
    }

    const receipt = await Receipt.findOne({ saleId }).populate({
      path: 'shop',
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
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
