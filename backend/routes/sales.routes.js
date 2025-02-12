import { createSale } from '../controllers/sales.controller.js';
import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/new', createSale);

export default router;
