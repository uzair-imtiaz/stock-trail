const express = require('express');
const {
  createAccount,
  getAccounts,
  getAccount,
  updateAccount,
  deleteAccount,
} = require('../controllers/account.controller');

const router = express.Router();

router.post('/new', createAccount);
router.get('/', getAccounts);
router.get('/:id', getAccount);
router.put('/:id/edit', updateAccount);
router.delete('/:id/delete', deleteAccount);

module.exports = router;
