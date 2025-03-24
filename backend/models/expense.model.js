const mongoose = require('mongoose');
const AutoIncrementFactory = require('mongoose-sequence');

const AutoIncrement = AutoIncrementFactory(mongoose);

const expenseSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  name: { type: String, required: true },
});

expenseSchema.plugin(AutoIncrement, { inc_field: 'id' });

const Expense = mongoose.model('Expense', expenseSchema);
module.exports = Expense;
