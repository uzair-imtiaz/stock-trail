const express = require('express');
const {
  createShop,
  getShops,
  updateShop,
  deleteShop,
} = require('../controllers/shop.controller');
const { authMiddleware, isAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getShops);
router.post('/new', createShop);
router.put('/:id/edit', updateShop);
router.delete('/:id', isAdmin, deleteShop);

module.exports = router;
