const mongoose = require('mongoose');
const AutoIncrementFactory = require('mongoose-sequence');

const AutoIncrement = AutoIncrementFactory(mongoose);

const otherAccountSchema = new mongoose.Schema(
  {
    otherAccountId: { type: Number, unique: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    openingBalance: { type: Number, required: true, default: 0 },
    balance: { type: Number, required: true, default: 0 },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

otherAccountSchema.index({ tenant: 1, name: 1 }, { unique: true });
otherAccountSchema.index({ tenant: 1, category: 1 });

otherAccountSchema.plugin(AutoIncrement, {
  id: 'otherAccount_otherAccountId',
  inc_field: 'otherAccountId',
  reference_fields: ['tenant'],
});

const OtherAccount = mongoose.model('OtherAccount', otherAccountSchema);

module.exports = OtherAccount;
