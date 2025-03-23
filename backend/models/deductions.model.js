import mongoose from 'mongoose';

const deductionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true, enum: ['Charge', 'Deduction'] },
});

const Deduction = mongoose.model('Deduction', deductionSchema);
export default Deduction;
