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
          await wastageItem.save();
        }
      }
      inventoryItem.quantity -=
        item.quantityDropped +
        (item.tpr / inventoryItem?.piecesPerCarton || 0) +
        item.wastage;
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

    const matchStage = { tenant: req.tenantId };
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

    const matchStage = { tenant: req.tenantId };
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
  try {
    const invoiceId = req.params.id;
    const invoice = await RouteActivity.findOneAndDelete({
      _id: invoiceId,
      tenant: req.tenantId,
    });
    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: 'Invoice not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Invoice deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const editSale = async (req, res) => {
  try {
    const saleId = req.params.id;
    const updatedSale = await RouteActivity.findOneAndUpdate(
      { _id: saleId, tenant: req.tenantId },
      req.body,
      { new: true }
    );
    if (!updatedSale) {
      return res.status(404).json({ success: false, message: 'Sale not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Sale updated successfully',
      data: updatedSale,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
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
