const mongoose = require('mongoose');
const RouteActivity = require('../models/routeActivity.model');
const Inventory = require('../models/inventory.model');
const inventoryService = require('../services/inventory.services');
const XLSX = require('xlsx');
const Route = require('../models/route.model');
const User = require('../models/user.model');

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
        (item.freePiecesDiscount / inventoryItem?.piecesPerCarton || 0) +
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

    const total =
      (await RouteActivity.countDocuments({ tenant: req.tenantId })) / pageSize;

    res.status(200).json({
      success: true,
      message: 'Invoices fetched successfully',
      data: invoices,
      pagination: {
        page,
        pageSize,
        next: page + 1 < total ? page + 1 : null,
        prev: page - 1 > 0 ? page - 1 : null,
        total,
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
    if (routeId) {
      if (Array.isArray(routeId)) {
        matchStage.routeId = {
          $in: routeId.map((id) => new mongoose.Types.ObjectId(id)),
        };
      } else {
        matchStage.routeId = new mongoose.Types.ObjectId(routeId);
      }
    }
    if (salesman) {
      matchStage.salesman = new mongoose.Types.ObjectId(salesman);
    }
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
          freePiecesDiscount: item.freePiecesDiscount,
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
      // Add back: dispatch quantity, TPR (converted to cartons), free pieces discount (converted to cartons), wastage (converted to cartons)
      // Subtract: return pieces (converted to cartons)
      const piecesPerCarton = inventoryItem.piecesPerCarton || 1;
      const tprInCartons = (item.tpr || 0) / piecesPerCarton;
      const freePiecesDiscountInCartons = (item.freePiecesDiscount || 0) / piecesPerCarton;
      const wastage = item.wastage || 0;
      const returnPieces = item.returnPieces || 0;

      const quantityToAddBack =
        (item.quantityDropped || 0) + tprInCartons + freePiecesDiscountInCartons + wastage - returnPieces;

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
        freePiecesDiscount: item.freePiecesDiscount || 0,
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
        freePiecesDiscount: 0,
        wastage: 0,
        returnPieces: 0,
      };

      const qtyDiff = (newItem.quantityDropped || 0) - oldItem.quantityDropped;
      const tprDiff = ((newItem.tpr || 0) - oldItem.tpr) / piecesPerCarton;
      const freePiecesDiscountDiff = ((newItem.freePiecesDiscount || 0) - (oldItem.freePiecesDiscount || 0)) / piecesPerCarton;
      const wastageDiff =
        ((newItem.wastage || 0) - oldItem.wastage) / piecesPerCarton;
      const returnedDiff =
        ((newItem.returnPieces || 0) - oldItem.returnPieces) / piecesPerCarton;

      // Final net stock adjustment
      const netStockChange = -qtyDiff - tprDiff - freePiecesDiscountDiff - wastageDiff + returnedDiff;
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

const importSalesFromExcel = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // Parse Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (!data || data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Excel file is empty or invalid',
      });
    }

    // Get all routes and users for validation
    const routes = await Route.find({ tenant: req.tenantId }).lean();
    const users = await User.find({ tenant: req.tenantId }).lean();
    const inventoryItems = await Inventory.find({ tenant: req.tenantId }).lean();

    // Create maps for lookups
    // Route: name (case-insensitive) -> ObjectId
    const routeMap = new Map(routes.map((r) => [r.name.toLowerCase().trim(), r._id]));

    // User: name (case-insensitive) -> ObjectId
    const userMap = new Map(users.map((u) => [u.name.toLowerCase().trim(), u._id]));

    // Inventory: product-flavor-grammage (case-insensitive) -> ObjectId
    // Handle multiple inventory items with same product-flavor-grammage
    const inventoryMap = new Map();
    const inventoryByKey = {};
    const inventoryGroups = {}; // Track all items per key for duplicate detection

    // Group inventory items by product-flavor-grammage
    inventoryItems.forEach((inv) => {
      const key = `${inv.product}-${inv.flavor}-${inv.grammage}g`.toLowerCase().trim();

      if (!inventoryGroups[key]) {
        inventoryGroups[key] = [];
      }
      inventoryGroups[key].push(inv);
    });

    // For each group, select the best item
    Object.keys(inventoryGroups).forEach((key) => {
      const items = inventoryGroups[key];

      // Filter to Main location items only (Wastage items can't be sold)
      const mainItems = items.filter(inv => inv.location === 'Main');

      if (mainItems.length === 0) {
        // Only Wastage items exist - skip this key
        return;
      }

      if (mainItems.length === 1) {
        // Only one Main item - use it
        inventoryByKey[key] = mainItems[0];
        inventoryMap.set(key, mainItems[0]._id);
      } else {
        // Multiple Main items exist - use selection logic:
        // 1. Prefer item with highest quantity (most stock available)
        // 2. If tied, prefer oldest opening date (FIFO - first in first out)
        const selectedItem = mainItems.reduce((best, current) => {
          if (current.quantity > best.quantity) {
            return current;
          } else if (current.quantity === best.quantity) {
            // If quantities are equal, prefer older opening date (FIFO)
            const currentDate = new Date(current.openingDate);
            const bestDate = new Date(best.openingDate);
            return currentDate < bestDate ? current : best;
          }
          return best;
        });

        inventoryByKey[key] = selectedItem;
        inventoryMap.set(key, selectedItem._id);
      }
    });

    const errors = [];
    const createdSales = [];
    const skippedRows = [];
    const duplicateInventoryWarnings = []; // Track when multiple items existed

    // Group rows by sale (Route, Salesman, Date, Driver, License)
    const saleGroups = new Map();

    // First pass: validate and group rows
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2; // +2 because Excel rows start at 1 and we have header

      // Validate required fields
      if (!row['Route Name'] || !row['Salesman Name'] || !row['Date']) {
        skippedRows.push({
          row: rowNumber,
          reason: 'Missing required fields (Route Name, Salesman Name, or Date)',
        });
        continue;
      }

      // Find route
      const routeName = String(row['Route Name']).trim().toLowerCase();
      const routeId = routeMap.get(routeName);
      if (!routeId) {
        skippedRows.push({
          row: rowNumber,
          reason: `Route "${row['Route Name']}" not found`,
        });
        continue;
      }

      // Find salesman
      const salesmanName = String(row['Salesman Name']).trim().toLowerCase();
      const salesmanId = userMap.get(salesmanName);
      if (!salesmanId) {
        skippedRows.push({
          row: rowNumber,
          reason: `Salesman "${row['Salesman Name']}" not found`,
        });
        continue;
      }

      // Parse date
      let saleDate;
      if (row['Date'] instanceof Date) {
        saleDate = row['Date'];
      } else {
        saleDate = new Date(row['Date']);
        if (isNaN(saleDate.getTime())) {
          skippedRows.push({
            row: rowNumber,
            reason: `Invalid date format: ${row['Date']}`,
          });
          continue;
        }
      }

      // Create sale key for grouping
      const saleKey = `${routeId}-${salesmanId}-${saleDate.toISOString().split('T')[0]}-${String(row['Driver Name'] || '').trim()}-${String(row['License Number'] || '').trim()}`;

      if (!saleGroups.has(saleKey)) {
        saleGroups.set(saleKey, {
          routeId,
          salesmanId,
          date: saleDate,
          driverName: String(row['Driver Name'] || '').trim(),
          licenseNumber: String(row['License Number'] || '').trim(),
          inventoryItems: [],
          rows: [],
        });
      }

      // Add inventory item if present
      if (row['Product'] && row['Flavor'] && row['Grammage']) {
        const productKey = `${String(row['Product']).trim()}-${String(row['Flavor']).trim()}-${String(row['Grammage']).trim()}g`.toLowerCase();
        const itemId = inventoryMap.get(productKey);

        if (!itemId) {
          // Try to find similar items for better error message
          const similarItems = inventoryItems.filter(inv =>
            inv.product.toLowerCase().trim() === String(row['Product']).toLowerCase().trim() &&
            inv.flavor.toLowerCase().trim() === String(row['Flavor']).toLowerCase().trim()
          );

          let reason = `Inventory item not found: ${row['Product']} ${row['Flavor']} ${row['Grammage']}g`;
          if (similarItems.length > 0) {
            const availableGrammages = [...new Set(similarItems.map(i => i.grammage))].join(', ');
            reason += `. Available grammages for this product/flavor: ${availableGrammages}g`;
          }

          skippedRows.push({
            row: rowNumber,
            reason,
          });
          continue;
        }

        // Verify the item exists and is accessible
        const inventoryItem = inventoryByKey[productKey];
        if (!inventoryItem) {
          skippedRows.push({
            row: rowNumber,
            reason: `Inventory item "${row['Product']} ${row['Flavor']} ${row['Grammage']}g" not found or only available in Wastage location.`,
          });
          continue;
        }

        // Check if multiple items exist and warn (but still proceed)
        const itemsInGroup = inventoryGroups[productKey] || [];
        const mainItemsInGroup = itemsInGroup.filter(inv => inv.location === 'Main');
        if (mainItemsInGroup.length > 1) {
          // Multiple Main items exist - the one with highest quantity/oldest date was selected
          duplicateInventoryWarnings.push({
            row: rowNumber,
            product: `${row['Product']} ${row['Flavor']} ${row['Grammage']}g`,
            selectedItemId: inventoryItem._id.toString(),
            selectedQuantity: inventoryItem.quantity,
            totalDuplicates: mainItemsInGroup.length,
            message: `Multiple inventory items found for "${row['Product']} ${row['Flavor']} ${row['Grammage']}g". Selected item with highest quantity (${inventoryItem.quantity} cartons).`,
          });
        }

        saleGroups.get(saleKey).inventoryItems.push({
          itemId, // Already an ObjectId from the map
          quantityDropped: parseFloat(row['Dispatch Qty (Cartons)'] || 0) || 0,
          tpr: parseFloat(row['TPR (Free Pieces)'] || 0) || 0,
          freePiecesDiscount: parseFloat(row['Free Pieces Discount'] || 0) || 0,
          wastage: parseFloat(row['Wastage'] || 0) || 0,
          returnPieces: parseFloat(row['Return Pieces'] || 0) || 0,
          unitDeductions: [],
        });
        saleGroups.get(saleKey).rows.push(rowNumber);
      }
    }

    // Second pass: create sales from grouped data
    for (const [saleKey, saleData] of saleGroups.entries()) {
      try {
        if (saleData.inventoryItems.length === 0) {
          skippedRows.push({
            rows: saleData.rows,
            reason: 'No valid inventory items found for this sale',
          });
          continue;
        }

        // Create sale payload with ObjectId references
        // All IDs are already ObjectIds from MongoDB queries
        const salePayload = {
          routeId: saleData.routeId, // ObjectId from routeMap
          date: saleData.date,
          salesman: saleData.salesmanId, // ObjectId from userMap
          driverName: saleData.driverName,
          licenseNumber: saleData.licenseNumber,
          inventoryDropped: saleData.inventoryItems, // itemIds are already ObjectIds
          expenses: [],
          totalDeductions: [],
          tenant: req.tenantId, // ObjectId from middleware
        };

        // Create sale using existing logic
        const sale = new RouteActivity(salePayload);
        const savedSale = await sale.save({ session });

        // Update inventory
        for (const item of savedSale.inventoryDropped) {
          const inventoryItem = await Inventory.findOne({
            _id: item.itemId,
            tenant: req.tenantId,
          }).session(session);

          if (!inventoryItem) {
            throw new Error(`Inventory item not found: ${item.itemId}`);
          }

          if (item.wastage > 0) {
            const wastageItem = new Inventory({
              ...inventoryItem._doc,
              quantity: item.wastage,
              location: 'Wastage',
              _id: new mongoose.Types.ObjectId(),
              tenant: req.tenantId,
            });
            const savedWastageItem = await wastageItem.save({ session });
            item.wastageItemId = savedWastageItem._id;
          }

          inventoryItem.quantity -=
            item.quantityDropped +
            (item.tpr / (inventoryItem?.piecesPerCarton || 1)) +
            (item.freePiecesDiscount / (inventoryItem?.piecesPerCarton || 1)) +
            item.wastage -
            item.returnPieces;
          await inventoryItem.save({ session });
        }

        createdSales.push({
          rows: saleData.rows,
          saleId: savedSale._id,
        });
      } catch (error) {
        errors.push({
          rows: saleData.rows,
          error: error.message || 'Unknown error',
        });
      }
    }

    if (createdSales.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'No sales were created',
        errors,
        skippedRows,
      });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: `Successfully imported ${createdSales.length} sale(s)`,
      data: {
        created: createdSales.length,
        errors: errors.length,
        skipped: skippedRows.length,
        warnings: duplicateInventoryWarnings.length,
        details: {
          createdSales,
          errors,
          skippedRows,
          duplicateInventoryWarnings: duplicateInventoryWarnings.length > 0 ? duplicateInventoryWarnings : undefined,
        },
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error importing sales:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

const downloadSalesTemplate = async (req, res) => {
  try {
    // Get sample data for template - only Main location items
    const routes = await Route.find({ tenant: req.tenantId })
      .select('name')
      .limit(3)
      .lean();
    const users = await User.find({ tenant: req.tenantId })
      .select('name')
      .limit(3)
      .lean();
    const inventoryItems = await Inventory.find({
      tenant: req.tenantId,
      location: 'Main' // Only Main location items can be sold
    })
      .select('product flavor grammage')
      .limit(5)
      .lean();

    const today = new Date().toISOString().split('T')[0];
    const route1 = routes[0]?.name || 'Route 1';
    const route2 = routes[1]?.name || 'Route 2';
    const salesman1 = users[0]?.name || 'John Doe';
    const salesman2 = users[1]?.name || 'Jane Smith';

    // Create template data with examples showing:
    // 1. Multiple inventory items in the same sale (same route, salesman, date, driver, license)
    // 2. Different sales
    const templateData = [
      // First sale - multiple items
      {
        'Route Name': route1,
        'Salesman Name': salesman1,
        'Date': today,
        'Driver Name': 'Driver Name 1',
        'License Number': 'ABC-123',
        'Product': inventoryItems[0]?.product || 'Product Name',
        'Flavor': inventoryItems[0]?.flavor || 'Flavor',
        'Grammage': inventoryItems[0]?.grammage || 100,
        'Dispatch Qty (Cartons)': 10,
        'TPR (Free Pieces)': 0,
        'Free Pieces Discount': 0,
        'Wastage': 0,
        'Return Pieces': 0,
      },
      // Same sale, different item
      {
        'Route Name': route1,
        'Salesman Name': salesman1,
        'Date': today,
        'Driver Name': 'Driver Name 1',
        'License Number': 'ABC-123',
        'Product': inventoryItems[1]?.product || inventoryItems[0]?.product || 'Product Name',
        'Flavor': inventoryItems[1]?.flavor || inventoryItems[0]?.flavor || 'Flavor',
        'Grammage': inventoryItems[1]?.grammage || inventoryItems[0]?.grammage || 100,
        'Dispatch Qty (Cartons)': 5,
        'TPR (Free Pieces)': 2,
        'Free Pieces Discount': 0,
        'Wastage': 0,
        'Return Pieces': 0,
      },
      // Second sale - different route/salesman
      {
        'Route Name': route2 || route1,
        'Salesman Name': salesman2 || salesman1,
        'Date': today,
        'Driver Name': 'Driver Name 2',
        'License Number': 'XYZ-456',
        'Product': inventoryItems[2]?.product || inventoryItems[0]?.product || 'Product Name',
        'Flavor': inventoryItems[2]?.flavor || inventoryItems[0]?.flavor || 'Flavor',
        'Grammage': inventoryItems[2]?.grammage || inventoryItems[0]?.grammage || 100,
        'Dispatch Qty (Cartons)': 8,
        'TPR (Free Pieces)': 0,
        'Free Pieces Discount': 3,
        'Wastage': 1,
        'Return Pieces': 0,
      },
    ];

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 18 }, // Route Name
      { wch: 18 }, // Salesman Name
      { wch: 12 }, // Date
      { wch: 18 }, // Driver Name
      { wch: 18 }, // License Number
      { wch: 18 }, // Product
      { wch: 18 }, // Flavor
      { wch: 12 }, // Grammage
      { wch: 22 }, // Dispatch Qty
      { wch: 20 }, // TPR
      { wch: 22 }, // Free Pieces Discount
      { wch: 12 }, // Wastage
      { wch: 15 }, // Return Pieces
    ];

    // Add instructions sheet
    const instructionsData = [
      { 'Column': 'Route Name', 'Description': 'Required. Must match an existing route name (case-insensitive)', 'Example': route1 },
      { 'Column': 'Salesman Name', 'Description': 'Required. Must match an existing user name (case-insensitive)', 'Example': salesman1 },
      { 'Column': 'Date', 'Description': 'Required. Date of the sale (YYYY-MM-DD format)', 'Example': today },
      { 'Column': 'Driver Name', 'Description': 'Optional. Name of the driver', 'Example': 'Driver Name 1' },
      { 'Column': 'License Number', 'Description': 'Optional. License plate number', 'Example': 'ABC-123' },
      { 'Column': 'Product', 'Description': 'Required. Product name (must match inventory)', 'Example': inventoryItems[0]?.product || 'Product Name' },
      { 'Column': 'Flavor', 'Description': 'Required. Product flavor (must match inventory)', 'Example': inventoryItems[0]?.flavor || 'Flavor' },
      { 'Column': 'Grammage', 'Description': 'Required. Product grammage in grams (must match inventory)', 'Example': inventoryItems[0]?.grammage || 100 },
      { 'Column': 'Dispatch Qty (Cartons)', 'Description': 'Optional. Quantity dispatched in cartons', 'Example': 10 },
      { 'Column': 'TPR (Free Pieces)', 'Description': 'Optional. Free pieces given as trade promotion', 'Example': 0 },
      { 'Column': 'Free Pieces Discount', 'Description': 'Optional. Free pieces given as customer discount', 'Example': 0 },
      { 'Column': 'Wastage', 'Description': 'Optional. Wastage quantity', 'Example': 0 },
      { 'Column': 'Return Pieces', 'Description': 'Optional. Returned pieces', 'Example': 0 },
      { 'Column': '', 'Description': '', 'Example': '' },
      { 'Column': 'IMPORTANT NOTES:', 'Description': '', 'Example': '' },
      { 'Column': '', 'Description': '1. Rows with the same Route, Salesman, Date, Driver Name, and License Number will be grouped into one sale', 'Example': '' },
      { 'Column': '', 'Description': '2. Multiple inventory items can be added to the same sale by using the same sale identifiers', 'Example': '' },
      { 'Column': '', 'Description': '3. Only inventory items in "Main" location can be sold (Wastage items are excluded)', 'Example': '' },
      { 'Column': '', 'Description': '4. All name matching is case-insensitive', 'Example': '' },
      { 'Column': '', 'Description': '5. Product, Flavor, and Grammage must exactly match an existing inventory item', 'Example': '' },
    ];

    const instructionsSheet = XLSX.utils.json_to_sheet(instructionsData);
    instructionsSheet['!cols'] = [
      { wch: 25 }, // Column
      { wch: 60 }, // Description
      { wch: 20 }, // Example
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Data');
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=sales-import-template.xlsx'
    );
    res.send(buffer);
  } catch (error) {
    console.error('Error generating template:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
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
  importSalesFromExcel,
  downloadSalesTemplate,
};
