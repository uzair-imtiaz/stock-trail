const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  vendorId: { type: Number, unique: true },
  name: { type: String, required: true },
  balance: { type: Number, default: 0 },
});

const Vendor = mongoose.model('Vendor', vendorSchema);
module.exports = Vendor;
