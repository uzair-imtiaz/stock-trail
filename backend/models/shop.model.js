import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

export const Shop = mongoose.model('Shop', shopSchema);
