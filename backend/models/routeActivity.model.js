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
  returnPieces: { type: Number, default: 0, required: true },
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
    const deductionIds = new Set();

    // Collect inventory IDs first
    if (this.inventoryDropped && this.inventoryDropped.length > 0) {
      for (const item of this.inventoryDropped) {
        if (!item.salePrice) {
          inventoryIds.add(item.itemId.toString());
        }
        if (item.unitDeductions && item.unitDeductions.length > 0) {
          for (const deduction of item.unitDeductions) {
            deductionIds.add(deduction._id.toString());
          }
        }
      }
    }

    if (this.totalDeductions && this.totalDeductions.length > 0) {
      for (const deduction of this.totalDeductions) {
        deductionIds.add(deduction._id.toString());
      }
    }

    // Fetch inventory items with sale prices
    const inventoryItems = await mongoose
      .model('Inventory')
      .find({ _id: { $in: Array.from(inventoryIds) } })
      .select('_id salePrice');

    const inventoryMap = {};
    inventoryItems.forEach((inv) => {
      inventoryMap[inv._id.toString()] = inv.salePrice;
    });

    // Fetch deduction items
    const deductionItems = await mongoose
      .model('Deduction')
      .find({ _id: { $in: Array.from(deductionIds) } })
      .select('_id type amount isPercentage');

    const deductionMap = {};
    deductionItems.forEach((ded) => {
      deductionMap[ded._id.toString()] = {
        type: ded.type,
      };
    });

    // Calculate total amount from inventory items
    console.log('deductionMap', deductionMap);
    for (const item of this.inventoryDropped) {
      if (!item.salePrice) {
        item.salePrice = inventoryMap[item.itemId.toString()] || 0;
      }

      let itemTotal = item.quantityDropped * item.salePrice;

      if (item.unitDeductions && item.unitDeductions.length > 0) {
        for (const deduction of item.unitDeductions) {
          const { type } = deductionMap[deduction._id.toString()];
          if (!type) continue;

          if (type === 'Charge') {
            itemTotal += deduction.isPercentage
              ? itemTotal * (deduction.amount / 100)
              : deduction.amount;
          } else if (type === 'Deduction') {
            itemTotal -= deduction.isPercentage
              ? itemTotal * (deduction.amount / 100)
              : deduction.amount;
          }
        }
      }
      item.netTotal = itemTotal;
      totalAmount += itemTotal;
    }

    // Store the base amount before applying total deductions
    const baseAmount = totalAmount;

    if (this.totalDeductions && this.totalDeductions.length > 0) {
      let totalDeductionAmount = 0;

      for (const deduction of this.totalDeductions) {
        const { type } = deductionMap[deduction._id.toString()];
        if (!type) continue;

        if (type === 'Charge') {
          const chargeAmount = deduction.isPercentage
            ? baseAmount * (deduction.amount / 100)
            : deduction.amount;
          totalDeductionAmount += chargeAmount;
        } else if (type === 'Deduction') {
          const deductionAmount = deduction.isPercentage
            ? baseAmount * (deduction.amount / 100)
            : deduction.amount;
          totalDeductionAmount -= deductionAmount;
        }
      }

      totalAmount -= totalDeductionAmount;
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
