const mongoose = require('mongoose');
const AutoIncrementFactory = require('mongoose-sequence');

const AutoIncrement = AutoIncrementFactory(mongoose);

const shopSchema = new mongoose.Schema({
  shopId: { type: Number, unique: true },
  name: { type: String, required: true },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
  },
});

shopSchema.plugin(AutoIncrement, { inc_field: 'shopId' });

const Shop = mongoose.model('Shop', shopSchema);

module.exports = Shop;
