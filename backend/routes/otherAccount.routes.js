const express = require('express');
const {
  createOtherAccount,
  getOtherAccounts,
  updateOtherAccount,
  deleteOtherAccount,
  getOtherAccountCategories,
} = require('../controllers/otherAccount.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/new', createOtherAccount);
router.get('/', getOtherAccounts);
router.get('/categories', getOtherAccountCategories);
router.put('/:id', updateOtherAccount);
router.delete('/:id', deleteOtherAccount);

module.exports = router;
