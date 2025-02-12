import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: true,
  },
  quantityDropped: { type: Number, required: true },
  unitPrice: { type: Number },
});

const InventoryDroppedSchema = new mongoose.Schema({
  items: [ItemSchema],
  creditAmount: { type: Number, required: true, default: 0 },
  tpr: { type: Number, required: true, default: 0 },
});

const ExpenseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true, default: 0 },
});

const RouteActivitySchema = new mongoose.Schema(
  {
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Routes',
      required: true,
    },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending',
    },
    salesman: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
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
    inventoryDropped: [InventoryDroppedSchema],
    expenses: [ExpenseSchema],
    totalAmount: { type: Number, default: 0 },
    profit: { type: Number, default: 0 },
  },
  { timestamps: true }
);

RouteActivitySchema.pre('save', async function (next) {
  try {
    let totalAmount = 0;
    let totalExpenses = 0;
    const inventoryIds = new Set();

    if (this.inventoryDropped && this.inventoryDropped.length > 0) {
      for (const drop of this.inventoryDropped) {
        for (const item of drop.items) {
          if (!item.unitPrice) {
            inventoryIds.add(item.itemId.toString());
          }
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

    for (const drop of this.inventoryDropped) {
      for (const item of drop.items) {
        if (!item.unitPrice) {
          item.unitPrice = inventoryMap[item.itemId.toString()] || 0;
        }
        totalAmount += item.quantityDropped * item.unitPrice;
      }
      totalAmount -= drop.creditAmount;
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

const RouteActivity = mongoose.model('RouteActivity', RouteActivitySchema);

export default RouteActivity;
