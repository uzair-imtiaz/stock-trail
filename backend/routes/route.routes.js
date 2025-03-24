const express = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const {
  createRoute,
  deleteRoute,
  getRoutes,
  updateRoute,
} = require('../controllers/route.controller');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getRoutes);
router.post('/new', createRoute);
router.put('/:id/edit', updateRoute);
router.delete('/:id/delete', deleteRoute);

module.exports = router;
