import express from 'express';
import {
  createShop,
  getShops,
  updateShop,
} from '../controllers/shop.controller.js';
import { authMiddleware, isAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getShops);
router.post('/new', isAdmin, createShop);
router.put('/:id/edit', isAdmin, updateShop);

export default router;
