const {
  createSale,
  getInvoices,
  getSale,
  getExpensesReport,
  getSalesReport,
  deleteInvoice,
  editSale,
  importSalesFromExcel,
  downloadSalesTemplate,
} = require('../controllers/sales.controller');
const express = require('express');
const multer = require('multer');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype ===
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.mimetype ===
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'), false);
    }
  },
});

router.post('/new', createSale);
router.post('/import', upload.single('file'), importSalesFromExcel);
router.get('/template', downloadSalesTemplate);
router.get('/', getInvoices);
router.get('/:id', getSale);
router.get('/report/expenses', getExpensesReport);
router.get('/report/sales', getSalesReport);
router.delete('/:id', deleteInvoice);
router.put('/:id', editSale);

module.exports = router;
