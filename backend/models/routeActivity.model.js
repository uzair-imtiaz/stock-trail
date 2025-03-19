import mongoose from 'mongoose';
import AutoIncrement from 'mongoose-sequence';

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
    driverName: {
      type: String,
      required: true,
    },
    licenseNumber: {
      type: String,
      required: true,
    },
    inventoryDropped: [ItemSchema],
    expenses: [ExpenseSchema],
    totalAmount: { type: Number, default: 0 },
    profit: { type: Number, default: 0 },
  },
  { timestamps: true },
  { _id: false }
);

RouteActivitySchema.pre('save', async function (next) {
  try {
    let totalAmount = 0;
    let totalExpenses = 0;
    const inventoryIds = new Set();

    if (this.inventoryDropped && this.inventoryDropped.length > 0) {
      for (const item of this.inventoryDropped) {
        if (!item.unitPrice) {
          inventoryIds.add(item.itemId.toString());
        }
      }
    }

    const inventoryItems = await mongoose
      .model('Inventory')
      .find({ _id: { $in: Array.from(inventoryIds) } })
      .select('_id unitPrice');

    const inventoryMap = {};
    inventoryItems.forEach((inv) => {
      inventoryMap[inv._id.toString()] = inv.unitPrice;
    });

    for (const item of this.inventoryDropped) {
      if (!item.unitPrice) {
        item.unitPrice = inventoryMap[item.itemId.toString()] || 0;
      }
      totalAmount += item.quantityDropped * item.unitPrice;
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

export default RouteActivity;
