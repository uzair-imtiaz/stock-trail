import express from 'express';
import {
  createDeduction,
  getDeductions,
  updateDeduction,
  deleteDeduction,
} from '../controllers/deduction.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);
router.post('/new', createDeduction);
router.get('/', getDeductions);
router.put('/:id/edit', updateDeduction);
router.delete('/:id/delete', deleteDeduction);

export default router;
