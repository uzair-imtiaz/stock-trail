import Account from '../models/account.model.js';
import { asyncHandler } from '../utils/error.util.js';

export const createAccount = asyncHandler(async (req, res) => {
  const { name, type, balance } = req.body;

  const existingAccount = await Account.findOne({ name });
  if (existingAccount) {
    return res.status(400).json({
      success: false,
      message: 'Account with this name already exists',
    });
  }

  const account = new Account({ name, type, balance: balance || 0 });
  await account.save();

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: account,
  });
});

export const getAccounts = asyncHandler(async (req, res) => {
  const accounts = await Account.find();
  if (!accounts) {
    return res.status(400).json({
      success: false,
      message: 'Failed to fetch accounts',
    });
  }
  res.status(200).json({
    success: true,
    data: accounts,
    message: 'Accounts fetched successfully',
  });
});

export const getAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const account = await Account.findById(id);
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

export const updateAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, balance } = req.body;
  const account = await Account.findByIdAndUpdate(
    id,
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

export const deleteAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const account = await Account.findByIdAndDelete(id);
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
