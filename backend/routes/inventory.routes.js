const express = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const {
  createInventory,
  deleteInventory,
  getGroupedInventory,
  getInventory,
  transferStock,
  updateInventory,
} = require('../controllers/inventory.controller');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getInventory);
router.post('/new', createInventory);
router.put('/:id/edit', updateInventory);
router.delete('/:id/delete', deleteInventory);
router.get('/grouped', getGroupedInventory);
router.post('/transfer-stock', transferStock);

module.exports = router;
