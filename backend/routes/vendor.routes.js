const express = require('express');
const {
  createVendor,
  getVendors,
  getVendor,
  updateVendor,
  deleteVendor,
} = require('../controllers/vendor.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/new', createVendor);
router.get('/', getVendors);
router.get('/:id', getVendor);
router.put('/:id/edit', updateVendor);
router.delete('/:id', deleteVendor);

module.exports = router;
