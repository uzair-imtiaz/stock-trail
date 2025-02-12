import express from 'express';
import {
  getUsers,
  updateUserAccess,
  getSingleUSer,
} from '../controllers/user.controller.js';
import { authMiddleware, isAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware, isAdmin);

router.get('/', getUsers);
router.put('/:userId/update-access', updateUserAccess);
router.get('/:role', getSingleUSer);

export default router;
