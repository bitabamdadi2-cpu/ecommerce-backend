const express = require('express');
const router = express.Router({ mergeParams: true }); // برای دسترسی به :productId والد
const { getProductReviews, createReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middlewares/auth');

router.get('/', getProductReviews);
router.post('/', protect, createReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
