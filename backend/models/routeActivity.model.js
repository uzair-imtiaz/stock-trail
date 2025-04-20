const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence');

const ItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: true,
  },
  quantityDropped: { type: Number, required: true },
  wastage: { type: Number, default: 0, required: true },
  tpr: { type: Number, default: 0, required: true },
  unitPrice: { type: Number },
  unitDeductions: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Deduction',
        required: true,
      },
      amount: { type: Number, required: true },
      isPercentage: { type: Boolean, default: false },
    },
  ],
  netTotal: { type: Number },
});

const ExpenseSchema = new mongoose.Schema({
  description: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense',
    required: true,
  },
  amount: { type: Number, required: true, default: 0 },
});

const RouteActivitySchema = new mongoose.Schema(
  {
    _id: Number,
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      required: true,
    },
    date: { type: Date, required: true },
    salesman: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    driverName: { type: String, required: true },
    licenseNumber: { type: String, required: true },
    inventoryDropped: [ItemSchema],
    expenses: [ExpenseSchema],
    totalAmount: { type: Number, default: 0 },
    profit: { type: Number, default: 0 },
    hasReceipt: { type: Boolean, default: false },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },
    totalDeductions: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Deduction',
          required: true,
        },
        amount: { type: Number, required: true },
        isPercentage: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true },
  { _id: false }
);

/**
 * Pre-save hook to calculate totalAmount, considering:
 * - Inventory items' prices
 * - Item-level deductions/charges
 * - Global deductions/charges
 * - Expenses
 */
RouteActivitySchema.pre('save', async function (next) {
  try {
    let totalAmount = 0;
    let totalExpenses = 0;

    const inventoryIds = new Set();

    if (this.inventoryDropped && this.inventoryDropped.length > 0) {
      for (const item of this.inventoryDropped) {
        if (!item.salePrice) {
          inventoryIds.add(item.itemId.toString());
        }
      }
    }

    const inventoryItems = await mongoose
      .model('Inventory')
      .find({ _id: { $in: Array.from(inventoryIds) } })
      .select('_id salePrice');

    const inventoryMap = {};
    inventoryItems.forEach((inv) => {
      inventoryMap[inv._id.toString()] = inv.salePrice;
    });

    for (const item of this.inventoryDropped) {
      if (!item.salePrice) {
        item.salePrice = inventoryMap[item.itemId.toString()] || 0;
      }

      let itemTotal = item.quantityDropped * item.salePrice;

      if (item.unitDeductions.length > 0) {
        for (const deduction of item.unitDeductions) {
          if (deduction.type === 'Charge') {
            itemTotal += deduction.isPercentage
              ? itemTotal * deduction.amount
              : deduction.amount;
          } else if (deduction.type === 'Deduction') {
            itemTotal -= deduction.isPercentage
              ? itemTotal * deduction.amount
              : deduction.amount;
          }
        }
      }
      item.netTotal = itemTotal;
      totalAmount += itemTotal;
    }

    if (this.totalDeductions && this.totalDeductions.length > 0) {
      for (const deduction of this.totalDeductions) {
        if (deduction.type === 'Charge') {
          totalAmount += deduction.isPercentage
            ? totalAmount * deduction.amount
            : deduction.amount;
        } else if (deduction.type === 'Deduction') {
          totalAmount -= deduction.isPercentage
            ? totalAmount * deduction.amount
            : deduction.amount;
        }
      }
    }

    if (this.expenses && this.expenses.length > 0) {
      totalExpenses = this.expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );
    }
    this.totalAmount = totalAmount;
    this.profit = totalAmount - totalExpenses;

    next();
  } catch (error) {
    next(error);
  }
});

RouteActivitySchema.plugin(AutoIncrement(mongoose));

const RouteActivity = mongoose.model('RouteActivity', RouteActivitySchema);

module.exports = RouteActivity;
