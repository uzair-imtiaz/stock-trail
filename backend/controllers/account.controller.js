const Account = require('../models/account.model');
const { asyncHandler } = require('../utils/error.util');

const createAccount = asyncHandler(async (req, res) => {
  try {
    const { name, type, balance } = req.body;

    const existingAccount = await Account.findOne({
      name,
      tenant: req.tenantId,
    });
    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: 'Account with this name already exists',
      });
    }

    const account = new Account({
      name,
      type,
      balance: balance || 0,
      tenant: req.tenantId,
    });
    await account.save();

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: account,
    });
  } catch (error) {
    console.log('error', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
});

const getAccounts = asyncHandler(async (req, res) => {
  const accounts = await Account.find({ tenant: req.tenantId });

  if (!accounts) {
    return res.status(400).json({
      success: false,
      message: 'Could not fetch accounts',
    });
  }

  res.status(200).json({
    success: true,
    data: accounts,
    message: 'Accounts fetched successfully',
  });
});

const getAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const account = await Account.findOne({ _id: id, tenant: req.tenantId });

  if (!account) {
    return res.status(404).json({
      success: false,
      message: 'Account not found',
    });
  }

  res.status(200).json({
    success: true,
    data: account,
    message: 'Account fetched successfully',
  });
});

const updateAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, balance } = req.body;

  const account = await Account.findOneAndUpdate(
    { _id: id, tenant: req.tenantId },
    { name, balance },
    { new: true }
  );

  if (!account) {
    return res.status(404).json({
      success: false,
      message: 'Account not found',
    });
  }

  res.status(200).json({
    success: true,
    data: account,
    message: 'Account updated successfully',
  });
});

const deleteAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const account = await Account.findOneAndDelete({
    _id: id,
    tenant: req.tenantId,
  });

  if (!account) {
    return res.status(404).json({
      success: false,
      message: 'Account not found',
    });
  }

  res.status(200).json({
    success: true,
    data: account,
    message: 'Account deleted successfully',
  });
});

module.exports = {
  updateAccount,
  deleteAccount,
  getAccount,
  getAccounts,
  createAccount,
};
