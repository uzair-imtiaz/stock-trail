const mongoose = require('mongoose');

const deductionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true, enum: ['Charge', 'Deduction'] },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
  },
});

const Deduction = mongoose.model('Deduction', deductionSchema);
module.exports = Deduction;
