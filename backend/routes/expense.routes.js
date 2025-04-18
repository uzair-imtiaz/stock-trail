const { authMiddleware } = require('../middlewares/auth.middleware');
const express = require('express');
const {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
} = require('../controllers/expense.controller');

const router = express.Router();

router.use(authMiddleware);

router.post('/new', createExpense);
router.get('/', getExpenses);
router.put('/:id/edit', updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
