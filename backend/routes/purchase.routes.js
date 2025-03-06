import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { createPurchase } from '../controllers/purchase.controller.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/new', createPurchase);

export default router;
