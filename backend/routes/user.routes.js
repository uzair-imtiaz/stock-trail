const express = require('express');
const {
  getUsers,
  updateUserAccess,
  getSingleUSer,
  createUser,
} = require('../controllers/user.controller');
const { authMiddleware, isAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware, isAdmin);

router.get('/', getUsers);
router.put('/:userId/update-access', updateUserAccess);
router.get('/:role', getSingleUSer);
router.post('/new', createUser);

module.exports = router;
