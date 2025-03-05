import { authMiddleware } from '../middlewares/auth.middleware.js';
import express from 'express';
import {
  createExpense,
  getExpenses,
  updateExpense,
} from '../controllers/expense.controller.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/new', createExpense);
router.get('/', getExpenses);
router.put('/:id/edit', updateExpense);

export default router;
