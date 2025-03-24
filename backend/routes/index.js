const express = require('express');
const authRoutes = require('./auth.routes');
const routeRoutes = require('./route.routes');
const userRoutes = require('./user.routes');
const inventoryRoutes = require('./inventory.routes');
const salesRoutes = require('./sales.routes');
const shopRoutes = require('./shop.routes');
const receiptRoutes = require('./receipt.routes');
const accountRoutes = require('./account.routes');
const expenseRoutes = require('./expense.routes');
const purchaseRoutes = require('./purchase.routes');
const deductionRoutes = require('./deduction.routes');
const vendorRoutes = require('./vendor.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/routes', routeRoutes);
router.use('/users', userRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/sales', salesRoutes);
router.use('/shops', shopRoutes);
router.use('/receipts', receiptRoutes);
router.use('/accounts', accountRoutes);
router.use('/expenses', expenseRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/deductions', deductionRoutes);
router.use('/vendors', vendorRoutes);
module.exports = router;
