import mongoose from 'mongoose';
import AutoIncrementFactory from 'mongoose-sequence';

const AutoIncrement = AutoIncrementFactory(mongoose);

const expenseSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  name: { type: String, required: true },
});

expenseSchema.plugin(AutoIncrement, { inc_field: 'id' });

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
