const mongoose = require('mongoose');

const CreditSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
      index: true,
    },
    creditAmount: { type: Number, required: true, default: 0 },
    returnedAmount: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

const AdvanceSchema = new mongoose.Schema({
  role: { type: String, required: true },
  amount: { type: Number, required: true, default: 0 },
});

const ReceiptSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    saleId: {
      type: Number,
      ref: 'RouteActivity',
      required: true,
      index: true,
    },
    credits: [CreditSchema],
    advances: [AdvanceSchema],
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },
  },
  { timestamps: true }
);

const Receipt = mongoose.model('Receipt', ReceiptSchema);

module.exports = Receipt;
