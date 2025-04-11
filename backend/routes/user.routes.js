const express = require('express');
const {
  getUsers,
  updateUserAccess,
  getSingleUser,
  createUser,
} = require('../controllers/user.controller');
const { authMiddleware, isAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getUsers);
router.put('/:userId/update-access', isAdmin, updateUserAccess);
router.get('/:role', getSingleUser);
router.post('/new', isAdmin, createUser);

module.exports = router;
