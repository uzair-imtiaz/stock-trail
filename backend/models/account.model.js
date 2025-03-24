const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    balance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Account = mongoose.model('Account', AccountSchema);

module.exports = Account;
