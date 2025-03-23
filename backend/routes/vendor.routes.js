import express from 'express';
import {
  createVendor,
  getVendors,
  getVendor,
  updateVendor,
} from '../controllers/vendor.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/new', createVendor);
router.get('/', getVendors);
router.get('/:id', getVendor);
router.put('/:id/edit', updateVendor);

export default router;
