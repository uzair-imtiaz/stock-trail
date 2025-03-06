import Purchase from '../models/purchase.model.js';
import Account from '../models/account.model.js';
import mongoose from 'mongoose';
import Inventory from '../models/inventory.model.js';

export const createPurchase = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, bank, vendor } = req.body;

    const purchase = await Purchase.create([{ items, bank, vendor }], {
      session,
    });

    if (!purchase) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, message: 'Unable to create purchase' });
    }

    const bankAccount = await Account.findById(bank).session(session);
    if (!bankAccount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Bank account not found',
      });
    }
    const total = items.reduce((acc, item) => acc + item.total, 0);
    if (bankAccount.balance < total) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance in bank account',
      });
    }

    bankAccount.balance -= total;
    await bankAccount.save({ session });

    for (const item of items) {
      const inventoryItem = await Inventory.findOne({
        _id: item.itemId,
      }).session(session);

      if (!inventoryItem) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Item not found in inventory`,
        });
      }

      inventoryItem.quantity += item.quantity;
      await inventoryItem.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: 'Purchase created successfully',
      data: purchase,
    });
  } catch (error) {
    console.log('error', error);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};
