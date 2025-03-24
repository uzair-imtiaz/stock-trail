const express = require('express');
const {
  createShop,
  getShops,
  updateShop,
} = require('../controllers/shop.controller');
const { authMiddleware, isAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getShops);
router.post('/new', isAdmin, createShop);
router.put('/:id/edit', isAdmin, updateShop);

module.exports = router;
