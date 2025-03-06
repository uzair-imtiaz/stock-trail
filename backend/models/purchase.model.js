import mongoose from 'mongoose';
import AutoIncrement from 'mongoose-sequence';

const ItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: true,
  },
  quantity: { type: Number, required: true },
  gst: { type: Number, required: true },
  total: { type: Number, required: true },
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
      type: String,
      required: true,
    },
  },
  { timestamps: true },
  { _id: false }
);

PurchaseSchema.plugin(AutoIncrement(mongoose), { inc_field: 'purchaseId' });

const Purchase = mongoose.model('Purchase', PurchaseSchema);

export default Purchase;
