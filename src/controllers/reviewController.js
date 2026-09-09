const asyncHandler = require('../middlewares/asyncHandler');
const { AppError } = require('../middlewares/errorHandler');
const Review = require('../models/Review');
const Order = require('../models/Order');

// @route  GET /api/products/:productId/reviews
const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate('user', 'name')
    .sort('-createdAt');
  res.json({ success: true, count: reviews.length, data: reviews });
});

// @route  POST /api/products/:productId/reviews
const createReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;

  // بررسی اینکه آیا کاربر واقعا این محصول را خریده و تحویل گرفته است
  const hasPurchased = await Order.exists({
    user: req.user._id,
    status: 'delivered',
    'items.product': productId,
  });

  const existing = await Review.findOne({ user: req.user._id, product: productId });
  if (existing) throw new AppError('شما قبلا برای این محصول نظر ثبت کرده‌اید', 400);

  const review = await Review.create({
    user: req.user._id,
    product: productId,
    rating,
    comment,
    isVerifiedPurchase: !!hasPurchased,
  });

  res.status(201).json({ success: true, data: review });
});

// @route  DELETE /api/products/:productId/reviews/:id
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new AppError('نظر یافت نشد', 404);

  const isOwner = review.user.toString() === req.user._id.toString();
  const isAdmin = ['admin', 'manager'].includes(req.user.role);
  if (!isOwner && !isAdmin) throw new AppError('اجازه حذف این نظر را ندارید', 403);

  await review.deleteOne();
  await Review.recalculateProductRating(review.product);

  res.json({ success: true, message: 'نظر حذف شد' });
});

module.exports = { getProductReviews, createReview, deleteReview };
