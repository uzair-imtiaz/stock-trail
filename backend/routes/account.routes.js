import express from 'express';
import {
  createAccount,
  getAccounts,
  getAccount,
  updateAccount,
  deleteAccount,
} from '../controllers/account.controller.js';

const router = express.Router();

router.post('/new', createAccount);
router.get('/', getAccounts);
router.get('/:id', getAccount);
router.put('/:id/edit', updateAccount);
router.delete('/:id/delete', deleteAccount);

export default router;
