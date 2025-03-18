import {
  createSale,
  getInvoices,
  getSale,
  getExpensesReport,
  getSalesReport,
} from '../controllers/sales.controller.js';
import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/new', createSale);
router.get('/', getInvoices);
router.get('/:id', getSale);
router.get('/report/expenses', getExpensesReport);
router.get('/report/sales', getSalesReport);

export default router;
