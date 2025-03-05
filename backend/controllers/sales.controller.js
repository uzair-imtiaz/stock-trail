import mongoose from 'mongoose';
import RouteActivity from '../models/routeActivity.model.js';
import Inventory from '../models/inventory.model.js';

export const createSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const sale = new RouteActivity(req.body);
    const savedSale = await sale.save();
    if (!savedSale) {
      return res.status(400).json({
        success: false,
        message: 'Failed to create sale',
      });
    }
    for (const drop of savedSale.inventoryDropped) {
      for (const item of drop.items) {
        const inventoryItem = await Inventory.findById(item.itemId).session(
          session
        );
        if (!inventoryItem) {
          await session.abortTransaction();
          return res.status(404).json({
            success: false,
            message: 'Inventory item not found',
          });
        }

        if (item.wastage > 0) {
          const wastageItem = new Inventory({
            ...inventoryItem._doc,
            quantity: item.wastage,
            location: 'Wastage',
            _id: new mongoose.Types.ObjectId(),
          });

          if (!wastageItem) {
            await session.abortTransaction();
            return res.status(404).json({
              success: false,
              message: 'Inventory item not found',
            });
          } else {
            await wastageItem.save();
          }
        }
        inventoryItem.quantity -=
          item.quantityDropped + (item.tpr / 10 || 0) + item.wastage;
        await inventoryItem.save();
      }
    }
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: 'Sale created successfully',
      data: savedSale,
    });
  } catch (error) {
    console.log('error', error);
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

export const getSale = async (req, res) => {
  try {
    const sale = await RouteActivity.findById(req.params.id)
      .populate({
        path: 'routeId',
        select: 'name',
      })
      .lean();
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Sale fetched successfully',
      data: sale,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

export const getInvoices = async (req, res) => {
  try {
    const invoices = await RouteActivity.find({})
      .populate({
        path: 'routeId',
        select: 'name',
      })
      .populate({
        path: 'salesman',
        select: 'name',
      })
      .populate({
        path: 'expenses.id',
        select: 'name',
      })
      .sort({ createdAt: -1 });
    if (!invoices) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch invoices',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Invoices fetched successfully',
      data: invoices,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};
