const asyncHandler = require('../middlewares/asyncHandler');
const { AppError } = require('../middlewares/errorHandler');
const Coupon = require('../models/Coupon');
const Cart = require('../models/Cart');

// @route  POST /api/coupons/apply
const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const coupon = await Coupon.findOne({ code: code?.toUpperCase() });
  if (!coupon) throw new AppError('کد تخفیف نامعتبر است', 404);

  const cart = await Cart.findOne({ user: req.user._id });
  const cartTotal = cart ? cart.items.reduce((s, i) => s + i.price * i.quantity, 0) : 0;

  const check = coupon.isValid(cartTotal);
  if (!check.valid) throw new AppError(check.reason, 400);

  let discount =
    coupon.discountType === 'percent'
      ? (cartTotal * coupon.discountValue) / 100
      : coupon.discountValue;

  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);

  res.json({
    success: true,
    data: { couponId: coupon._id, code: coupon.code, discount, cartTotal, payable: cartTotal - discount },
  });
});

const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort('-createdAt');
  res.json({ success: true, data: coupons });
});

const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, data: coupon });
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) throw new AppError('کد تخفیف یافت نشد', 404);
  res.json({ success: true, message: 'کد تخفیف حذف شد' });
});

module.exports = { applyCoupon, getCoupons, createCoupon, deleteCoupon };
