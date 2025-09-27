const mongoose = require('mongoose');
const OtherAccount = require('../models/otherAccount.model');
const Receipt = require('../models/receipt.model');
const { asyncHandler } = require('../utils/error.util');

const sanitizeString = (value = '') => value.trim();

const parseAmount = (value) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return null;
  }
  return parsed;
};

const createOtherAccount = asyncHandler(async (req, res) => {
  const name = sanitizeString(req.body?.name || '');
  const category = sanitizeString(req.body?.category || '');
  const openingBalance = parseAmount(req.body?.openingBalance ?? 0);

  if (!name || !category) {
    return res.status(400).json({
      success: false,
      message: 'Name and category are required',
    });
  }

  if (openingBalance === null) {
    return res.status(400).json({
      success: false,
      message: 'Opening balance must be a valid number',
    });
  }

  const existing = await OtherAccount.findOne({
    tenant: req.tenantId,
    name,
  });

  if (existing) {
    return res.status(400).json({
      success: false,
      message: 'Other account with this name already exists',
    });
  }

  const account = await OtherAccount.create({
    name,
    category,
    openingBalance,
    balance: openingBalance,
    tenant: req.tenantId,
  });

  return res.status(201).json({
    success: true,
    message: 'Other account created successfully',
    data: account,
  });
});

const getOtherAccounts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, category, search } = req.query;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

  const filter = { tenant: req.tenantId };

  if (category) {
    filter.category = sanitizeString(category);
  }

  if (search) {
    filter.name = { $regex: new RegExp(sanitizeString(search), 'i') };
  }

  const [accounts, total] = await Promise.all([
    OtherAccount.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize),
    OtherAccount.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    message: 'Other accounts fetched successfully',
    data: accounts,
    pagination: {
      page: pageNum,
      pageSize,
      total,
      hasNext: pageNum * pageSize < total,
    },
  });
});

const updateOtherAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid other account id',
    });
  }

  const name = sanitizeString(req.body?.name || '');
  const category = sanitizeString(req.body?.category || '');

  if (!name || !category) {
    return res.status(400).json({
      success: false,
      message: 'Name and category are required',
    });
  }

  const account = await OtherAccount.findOne({
    _id: id,
    tenant: req.tenantId,
  });

  if (!account) {
    return res.status(404).json({
      success: false,
      message: 'Other account not found',
    });
  }

  if (account.name !== name) {
    const duplicate = await OtherAccount.findOne({
      tenant: req.tenantId,
      name,
      _id: { $ne: id },
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: 'Other account with this name already exists',
      });
    }
  }

  account.name = name;
  account.category = category;

  await account.save();

  return res.status(200).json({
    success: true,
    message: 'Other account updated successfully',
    data: account,
  });
});

const deleteOtherAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid other account id',
    });
  }

  const account = await OtherAccount.findOne({
    _id: id,
    tenant: req.tenantId,
  });

  if (!account) {
    return res.status(404).json({
      success: false,
      message: 'Other account not found',
    });
  }

  const isInUse = await Receipt.exists({
    tenant: req.tenantId,
    $or: [
      { 'otherCredits.otherAccount': id },
      { 'otherDebits.otherAccount': id },
    ],
  });

  if (isInUse) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete other account while it is linked to receipts',
    });
  }

  await account.deleteOne();

  return res.status(200).json({
    success: true,
    message: 'Other account deleted successfully',
  });
});

const getOtherAccountCategories = asyncHandler(async (req, res) => {
  const categories = await OtherAccount.distinct('category', {
    tenant: req.tenantId,
  });

  categories.sort((a, b) => a.localeCompare(b));

  return res.status(200).json({
    success: true,
    message: 'Categories fetched successfully',
    data: categories,
  });
});

module.exports = {
  createOtherAccount,
  getOtherAccounts,
  updateOtherAccount,
  deleteOtherAccount,
  getOtherAccountCategories,
};
