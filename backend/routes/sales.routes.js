const {
  createSale,
  getInvoices,
  getSale,
  getExpensesReport,
  getSalesReport,
} = require('../controllers/sales.controller');
const express = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/new', createSale);
router.get('/', getInvoices);
router.get('/:id', getSale);
router.get('/report/expenses', getExpensesReport);
router.get('/report/sales', getSalesReport);

module.exports = router;
