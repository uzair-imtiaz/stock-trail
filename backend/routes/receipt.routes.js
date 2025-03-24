const express = require('express');
const {
  createOrUpdateReceipt,
  getReceipts,
  generateCreditReport,
  getReceipt,
} = require('../controllers/receipt.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/new', createOrUpdateReceipt);
router.get('/', getReceipts);
router.get('/:id', getReceipt);
router.get('/report/credits', generateCreditReport);

module.exports = router;
