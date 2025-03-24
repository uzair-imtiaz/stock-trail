const { authMiddleware } = require('../middlewares/auth.middleware');
const express = require('express');
const {
  createExpense,
  getExpenses,
  updateExpense,
} = require('../controllers/expense.controller');

const router = express.Router();

router.use(authMiddleware);

router.post('/new', createExpense);
router.get('/', getExpenses);
router.put('/:id/edit', updateExpense);

module.exports = router;
