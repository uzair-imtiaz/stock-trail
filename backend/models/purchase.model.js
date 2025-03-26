const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence');

const ItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: true,
  },
  quantity: { type: Number, required: true },
  total: { type: Number, required: true },
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
});

const PurchaseSchema = new mongoose.Schema(
  {
    purchaseId: { type: Number, unique: true },
    items: [ItemSchema],
    bank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bank',
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
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
    total: { type: Number },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },
  },
  { timestamps: true },
  { _id: false }
);

PurchaseSchema.plugin(AutoIncrement(mongoose), { inc_field: 'purchaseId' });

const Purchase = mongoose.model('Purchase', PurchaseSchema);

module.exports = Purchase;
