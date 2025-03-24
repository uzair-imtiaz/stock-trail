const express = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { createPurchase } = require('../controllers/purchase.controller');

const router = express.Router();

router.use(authMiddleware);

router.post('/new', createPurchase);

module.exports = router;
