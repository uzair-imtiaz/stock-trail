import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: String,
      required: true,
      enum: ['Lays'],
    },
    flavor: { type: String, required: true },
    grammage: { type: Number, required: true },
    location: {
      type: String,
      required: true,
      enum: ['Main', 'Secondary'],
      default: 'Main',
    },
    vendor: { name: { type: String, required: true }, phone: { type: String } },
    purchasePrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    expiryDate: { type: Date, required: true },
  },
  { timestamps: true }
);

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;
