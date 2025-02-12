import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import {
  createInventory,
  deleteInventory,
  getGroupedInventory,
  getInventory,
  transferStock,
  updateInventory,
} from '../controllers/inventory.controller.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getInventory);
router.post('/new', createInventory);
router.put('/:id/edit', updateInventory);
router.delete('/:id/delete', deleteInventory);
router.get('/grouped', getGroupedInventory);
router.post('/transfer-stock', transferStock);

export default router;
