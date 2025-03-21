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
    category: { type: String, required: true },
    location: {
      type: String,
      required: true,
      enum: ['Main', 'Wastage'],
      default: 'Main',
    },
    stockType: {
      type: String,
      required: true,
      enum: ['Cartons', 'Pieces'],
      default: 'Cartons',
    },
    piecesPerCarton: { type: Number },
    salePrice: { type: Number, required: true },
    vendor: {
      type: Object,
      required: true,
      properties: {
        name: { type: String, required: true },
      },
    },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    openingDate: { type: Date, required: true },
  },
  { timestamps: true }
);

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;
