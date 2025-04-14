const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  shopId: { type: String, unique: true },
  name: { type: String, required: true },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
  },
});

const Shop = mongoose.model('Shop', shopSchema);

module.exports = Shop;
