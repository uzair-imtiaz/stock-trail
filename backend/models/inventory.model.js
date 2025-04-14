const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: String,
      required: true,
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
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    openingDate: { type: Date, required: true },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },
  },
  { timestamps: true }
);

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;
