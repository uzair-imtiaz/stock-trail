const mongoose = require('mongoose');
const RouteActivity = require('../models/routeActivity.model');
const Inventory = require('../models/inventory.model');
const inventoryService = require('../services/inventory.services');

const createSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const sale = new RouteActivity({ ...req.body, tenant: req.tenantId });
    const savedSale = await sale.save();
    if (!savedSale) {
      return res.status(400).json({
        success: false,
        message: 'Failed to create sale',
      });
    }
    for (const item of savedSale.inventoryDropped) {
      const inventoryItem = await Inventory.findOne({
        _id: item.itemId,
        tenant: req.tenantId,
      }).session(session);
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
          tenant: req.tenantId,
        });

        if (!wastageItem) {
          await session.abortTransaction();
          return res.status(404).json({
            success: false,
            message: 'Inventory item not found',
          });
        } else {
          const savedWastageItem = await wastageItem.save();
          // Store the wastage item ID in the sale record for proper tracking
          item.wastageItemId = savedWastageItem._id;
        }
      }
      inventoryItem.quantity -=
        item.quantityDropped +
        (item.tpr / inventoryItem?.piecesPerCarton || 0) +
        item.wastage -
        item.returnPieces;
      await inventoryItem.save();
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

const getSale = async (req, res) => {
  try {
    const sale = await RouteActivity.findOne({
      _id: req.params.id,
      tenant: req.tenantId,
    })
      .populate({
        path: 'routeId',
        select: 'name shops',
        populate: {
          path: 'shops',
          select: 'name',
        },
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

const getInvoices = async (req, res) => {
  try {
    let { page, limit: pageSize } = req.query;
    page = parseInt(page, 10) || 1;
    pageSize = parseInt(pageSize, 10) || 50;
    const invoices = await RouteActivity.find({ tenant: req.tenantId })
      .populate({
        path: 'routeId',
        select: 'name',
      })
      .populate({
        path: 'salesman',
        select: 'name',
      })
      .populate({
        path: 'expenses._id',
        select: 'name',
      })
      .limit(pageSize)
      .skip((page - 1) * pageSize)
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
      pagination: {
        page,
        pageSize,
        total: await RouteActivity.countDocuments({ tenant: req.tenantId }),
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

const getExpensesReport = async (req, res) => {
  try {
    const { startDate, endDate, routeId, salesman } = req.query;

    const matchStage = { tenant: new mongoose.Types.ObjectId(req.tenantId) };
    if (startDate && endDate) {
      matchStage.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    if (routeId) matchStage.routeId = routeId;
    if (salesman) matchStage.salesman = salesman;

    const expenseReport = await RouteActivity.aggregate([
      { $match: matchStage },
      { $unwind: '$expenses' },
      {
        $lookup: {
          from: 'expenses',
          localField: 'expenses.description',
          foreignField: '_id',
          as: 'expenseInfo',
        },
      },

      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            expenseName: { $arrayElemAt: ['$expenseInfo.name', 0] },
          },
          amount: { $sum: '$expenses.amount' },
        },
      },

      {
        $project: {
          _id: 0,
          date: '$_id.date',
          name: '$_id.expenseName',
          amount: 1,
        },
      },

      { $sort: { date: -1 } },
    ]);

    res.status(200).json({
      success: true,
      message: 'Sales report fetched successfully',
      data: expenseReport,
    });
  } catch (error) {
    console.error('Error fetching sales report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, routeId, salesman } = req.query;

    const matchStage = { tenant: new mongoose.Types.ObjectId(req.tenantId) };
    if (startDate && endDate) {
      matchStage.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    if (routeId) matchStage.routeId = new mongoose.Types.ObjectId(routeId);
    if (salesman) matchStage.salesman = new mongoose.Types.ObjectId(salesman);
    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'routes',
          localField: 'routeId',
          foreignField: '_id',
          as: 'routeInfo',
        },
      },
      { $unwind: '$routeInfo' },
      {
        $lookup: {
          from: 'users',
          localField: 'salesman',
          foreignField: '_id',
          as: 'salesmanInfo',
        },
      },
      { $unwind: '$salesmanInfo' },
      {
        $project: {
          _id: 1,
          route: '$routeDetails.name',
          date: 1,
          salesman: '$salesmanDetails.name',
          driverName: 1,
          licenseNumber: 1,
          totalAmount: 1,
          profit: 1,
          inventoryDropped: 1,
        },
      },
      { $sort: { date: -1 } },
    ];

    const salesReport = await RouteActivity.aggregate(pipeline);
    const groupedInventory = await inventoryService.getGroupedInventory(
      req.tenantId
    );

    const report = transformInventoryData(salesReport, groupedInventory);

    if (!report) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch sales report',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Sales report fetched successfully',
      data: report,
    });
  } catch (error) {
    console.error('Error fetching sales report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

const transformInventoryData = (report, inventoryList) => {
  const inventoryMap = new Map(
    inventoryList.map((item) => [item._id.toString(), item])
  );

  return report.map((entry) => ({
    ...entry,
    inventoryDropped: entry.inventoryDropped
      .map((item) => {
        const inventoryItem = inventoryMap.get(item.itemId.toString());

        if (!inventoryItem) return null;

        return {
          _id: item.itemId,
          product: inventoryItem.product,
          grammage: inventoryItem.grammage,
          category: inventoryItem.category,
          location: inventoryItem.location,
          unitPrice: inventoryItem.unitPrice,
          quantity: item.quantityDropped,
          tpr: item.tpr,
          wastage: item.wastage,
        };
      })
      .filter((item) => item !== null),
  }));
};

const deleteInvoice = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const invoiceId = req.params.id;

    const invoice = await RouteActivity.findOne({
      _id: invoiceId,
      tenant: req.tenantId,
    }).session(session);

    if (!invoice) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: 'Invoice not found' });
    }

    // Reverse inventory changes for each item in the sale
    for (const item of invoice.inventoryDropped) {
      const inventoryItem = await Inventory.findOne({
        _id: item.itemId,
        tenant: req.tenantId,
      }).session(session);

      if (!inventoryItem) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: 'Inventory item not found',
        });
      }

      // Reverse the inventory changes made during sale creation
      // Add back: dispatch quantity, TPR (converted to cartons), wastage (converted to cartons)
      // Subtract: return pieces (converted to cartons)
      const piecesPerCarton = inventoryItem.piecesPerCarton || 1;
      const tprInCartons = (item.tpr || 0) / piecesPerCarton;
      const wastage = item.wastage || 0;
      const returnPieces = item.returnPieces || 0;

      const quantityToAddBack =
        (item.quantityDropped || 0) + tprInCartons + wastage - returnPieces;

      inventoryItem.quantity += quantityToAddBack;
      await inventoryItem.save({ session });

      // Remove wastage items if they exist
      if (item.wastage > 0 && item.wastageItemId) {
        await Inventory.findByIdAndDelete(item.wastageItemId).session(session);
      }
    }

    // Delete the sale
    await RouteActivity.findByIdAndDelete(invoiceId).session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: 'Invoice deleted successfully',
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error deleting invoice:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const editSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const saleId = req.params.id;
    const newData = req.body;

    const existingSale = await RouteActivity.findOne({
      _id: saleId,
      tenant: req.tenantId,
    }).session(session);

    if (!existingSale) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: 'Sale not found' });
    }

    // Fetch all involved inventory items to get piecesPerCarton
    const itemIds = [
      ...new Set(newData.inventoryDropped.map((item) => item.itemId)),
    ];

    const inventoryDocs = await Inventory.find({
      _id: { $in: itemIds },
      tenant: req.tenantId,
    }).session(session);

    const inventoryMap = {};
    for (const inv of inventoryDocs) {
      inventoryMap[inv._id.toString()] = inv;
    }

    // Map old items by itemId
    const oldItemsMap = {};
    for (const item of existingSale.inventoryDropped) {
      oldItemsMap[item.itemId.toString()] = {
        quantityDropped: item.quantityDropped,
        tpr: item.tpr || 0,
        wastage: item.wastage || 0,
        returnPieces: item.returnPieces || 0,
      };
    }

    for (const newItem of newData.inventoryDropped) {
      const itemId = newItem.itemId.toString();
      const invDoc = inventoryMap[itemId];
      if (!invDoc) continue; // safety check

      const piecesPerCarton = invDoc.piecesPerCarton || 1;

      const oldItem = oldItemsMap[itemId] || {
        quantityDropped: 0,
        tpr: 0,
        wastage: 0,
        returnPieces: 0,
      };

      const qtyDiff = (newItem.quantityDropped || 0) - oldItem.quantityDropped;
      const tprDiff = ((newItem.tpr || 0) - oldItem.tpr) / piecesPerCarton;
      const wastageDiff =
        ((newItem.wastage || 0) - oldItem.wastage) / piecesPerCarton;
      const returnedDiff =
        ((newItem.returnPieces || 0) - oldItem.returnPieces) / piecesPerCarton;

      // Final net stock adjustment
      const netStockChange = -qtyDiff - tprDiff - wastageDiff + returnedDiff;
      if (netStockChange !== 0) {
        await Inventory.updateOne(
          { _id: itemId, tenant: req.tenantId },
          { $inc: { quantity: netStockChange } },
          { session }
        );
      }
    }

    // Save updated sale
    Object.assign(existingSale, newData);
    const updatedSale = await existingSale.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: 'Sale updated and inventory adjusted successfully',
      data: updatedSale,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = {
  createSale,
  getSalesReport,
  getInvoices,
  getSale,
  getExpensesReport,
  deleteInvoice,
  editSale,
};
