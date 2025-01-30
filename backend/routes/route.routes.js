import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import {
  createRoute,
  deleteRoute,
  getRoutes,
  updateRoute,
} from '../controllers/route.controller.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getRoutes);
router.post('/new', createRoute);
router.put('/:id/edit', updateRoute);
router.delete('/:id/delete', deleteRoute);

export default router;
