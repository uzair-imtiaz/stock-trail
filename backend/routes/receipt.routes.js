import express from 'express';
import {
  createOrUpdateReceipt,
  getReceipts,
} from '../controllers/receipt.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/new', createOrUpdateReceipt);
router.get('/', getReceipts);
router.get('/:id', getReceipts);

export default router;
