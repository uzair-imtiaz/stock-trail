import Receipt from '../models/receipt.model.js';
import RouteActivity from '../models/routeActivity.model.js';

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

export const createReceipt = async (req, res) => {
  try {
    const { saleId, credits, returnedCredits, advances } = req.body;
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

    const receipt = await Receipt.create({
      saleId,
      credits: _credits,
      advances,
    });

    if (!receipt) {
      return res
        .status(400)
        .json({ success: false, message: 'Unable to create receipt' });
    }

    res.status(201).json({
      success: true,
      data: receipt,
      message: 'Receipt created successfully',
    });
  } catch (error) {
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
