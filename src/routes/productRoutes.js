const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, authorize } = require('../middlewares/auth');
const reviewRoutes = require('./reviewRoutes');

// نظرات هر محصول زیرمجموعه همان محصول است: /api/products/:productId/reviews
router.use('/:productId/reviews', reviewRoutes);

router.get('/', getProducts);
router.get('/:slug', getProductBySlug);
router.post('/', protect, authorize('admin', 'manager'), createProduct);
router.put('/:id', protect, authorize('admin', 'manager'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;
