const Expense = require('../models/expense.model');
const { asyncHandler } = require('../utils/error.util');

const createExpense = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const expense = await Expense.create({ name, tenant: req.tenantId });
  if (!expense) {
    return res.status(400).json({
      success: false,
      message: 'Failed to create expense',
    });
  }
  res.status(201).json({
    success: true,
    message: 'Expense created successfully',
    data: expense,
  });
});

const getExpenses = asyncHandler(async (req, res) => {
  const expenses = await Expense.find({ tenant: req.tenantId });
  if (!expenses) {
    return res.status(400).json({
      success: false,
      message: 'Failed to fetch expenses',
    });
  }
  res.status(200).json({
    success: true,
    message: 'Expenses fetched successfully',
    data: expenses,
  });
});

const updateExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const expense = await Expense.findOne({ _id: id, tenant: req.tenantId });
  if (!expense) {
    return res.status(400).json({
      success: false,
      message: 'Expense not found',
    });
  }
  expense.name = name;
  await expense.save();
  res.status(200).json({
    success: true,
    message: 'Expense updated successfully',
    data: expense,
  });
});

module.exports = {
  createExpense,
  getExpenses,
  updateExpense,
};
