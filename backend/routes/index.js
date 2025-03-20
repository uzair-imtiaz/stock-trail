import express from 'express';
import authRoutes from './auth.routes.js';
import routeRoutes from './route.routes.js';
import userRoutes from './user.routes.js';
import inventoryRoutes from './inventory.routes.js';
import salesRoutes from './sales.routes.js';
import shopRoutes from './shop.routes.js';
import receiptRoutes from './receipt.routes.js';
import accountRoutes from './account.routes.js';
import expenseRoutes from './expense.routes.js';
import purchaseRoutes from './purchase.routes.js';
import deductionRoutes from './deduction.routes.js';
import vendorRoutes from './vendor.routes.js';

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
export default router;
