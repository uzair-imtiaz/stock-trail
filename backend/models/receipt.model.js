import mongoose from 'mongoose';

const CreditSchema = new mongoose.Schema({
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true,
  },
  creditAmount: { type: Number, required: true, default: 0 },
  returnedAmount: { type: Number, required: true, default: 0 },
});

const AdvanceSchema = new mongoose.Schema({
  role: { type: String, required: true },
  amount: { type: Number, required: true, default: 0 },
});

const ReceiptSchema = new mongoose.Schema(
  {
    saleId: {
      type: Number,
      ref: 'RouteActivity',
      required: true,
    },
    credits: [CreditSchema],
    advances: [AdvanceSchema],
  },
  { timestamps: true }
);

const Receipt = mongoose.model('Receipt', ReceiptSchema);

export default Receipt;
