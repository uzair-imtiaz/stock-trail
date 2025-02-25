import express from 'express';
import {
  createReceipt,
  getReceipts,
} from '../controllers/receipt.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/new', createReceipt);
router.get('/', getReceipts);
router.get('/:id', getReceipts);

export default router;
