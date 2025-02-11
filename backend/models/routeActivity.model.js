import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: true,
  },
  quantityDropped: { type: Number, required: true },
  itemPrice: { type: Number, required: true },
});

const InventoryDroppedSchema = new mongoose.Schema({
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shops',
    required: true,
  },
  items: [ItemSchema],
  collectedAmount: { type: Number, required: true, default: 0 },
  creditAmount: { type: Number, required: true, default: 0 },
  tpr: { type: Number, required: true, default: 0 },
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
    deliveryPersonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
    },
    inventoryDropped: [InventoryDroppedSchema],
    expenses: { type: Number, required: true, default: 0 },
    totalAmount: { type: Number, required: true, default: 0 },
    profit: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

const RouteActivity = mongoose.model('RouteActivity', RouteActivitySchema);

export default RouteActivity;
