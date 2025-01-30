import express from 'express';
import authRoutes from './auth.routes.js';
import routeRoutes from './route.routes.js';
import userRoutes from './user.routes.js';
import inventoryRoutes from './inventory.routes.js';
const router = express.Router();

router.use('/auth', authRoutes);
router.use('/routes', routeRoutes);
router.use('/users', userRoutes);
router.use('/inventory', inventoryRoutes);

export default router;
