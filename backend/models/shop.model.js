import mongoose from 'mongoose';
import AutoIncrementFactory from 'mongoose-sequence';

const AutoIncrement = AutoIncrementFactory(mongoose);

const shopSchema = new mongoose.Schema({
  shopId: { type: Number, unique: true },
  name: { type: String, required: true },
});

shopSchema.plugin(AutoIncrement, { inc_field: 'shopId' });

export const Shop = mongoose.model('Shop', shopSchema);
