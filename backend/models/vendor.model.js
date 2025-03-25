const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence');

const vendorSchema = new mongoose.Schema({
  vendorId: { type: Number, unique: true },
  name: { type: String, required: true },
  balance: { type: Number, default: 0 },
});

vendorSchema.plugin(AutoIncrement(mongoose), { inc_field: 'vendorId' });

const Vendor = mongoose.model('Vendor', vendorSchema);
module.exports = Vendor;
