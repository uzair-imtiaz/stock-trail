const express = require('express');
const {
  createDeduction,
  getDeductions,
  updateDeduction,
  deleteDeduction,
} = require('../controllers/deduction.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);
router.post('/new', createDeduction);
router.get('/', getDeductions);
router.put('/:id/edit', updateDeduction);
router.delete('/:id/delete', deleteDeduction);

module.exports = router;
