import mongoose from 'mongoose';

const AccountSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    balance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Account = mongoose.model('Account', AccountSchema);

export default Account;
