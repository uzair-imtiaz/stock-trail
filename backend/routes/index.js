import express from 'express';
import authRoutes from './auth.routes.js';
import routeRoutes from './route.routes.js';
import userRoutes from './user.routes.js';
import inventoryRoutes from './inventory.routes.js';
import salesRoutes from './sales.routes.js';
import shopRoutes from './shop.routes.js';
import receiptRoutes from './receipt.routes.js';
import accountRoutes from './account.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/routes', routeRoutes);
router.use('/users', userRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/sales', salesRoutes);
router.use('/shops', shopRoutes);
router.use('/receipts', receiptRoutes);
router.use('/accounts', accountRoutes);

export default router;
