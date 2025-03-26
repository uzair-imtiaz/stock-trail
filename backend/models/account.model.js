const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    balance: { type: Number, default: 0 },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },
  },
  { timestamps: true }
);

AccountSchema.index({ tenant: 1, name: 1 }, { unique: true });

const Account = mongoose.model('Account', AccountSchema);

module.exports = Account;
