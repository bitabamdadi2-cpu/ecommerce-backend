const express = require('express');
const router = express.Router();
const { applyCoupon, getCoupons, createCoupon, deleteCoupon } = require('../controllers/couponController');
const { protect, authorize } = require('../middlewares/auth');

router.post('/apply', protect, applyCoupon);
router.get('/', protect, authorize('admin', 'manager'), getCoupons);
router.post('/', protect, authorize('admin', 'manager'), createCoupon);
router.delete('/:id', protect, authorize('admin'), deleteCoupon);

module.exports = router;
