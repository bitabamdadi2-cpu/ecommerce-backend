const mongoose = require('mongoose');
const asyncHandler = require('../middlewares/asyncHandler');
const { AppError } = require('../middlewares/errorHandler');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');

// @route  POST /api/orders  - ثبت سفارش از روی سبد خرید فعلی
const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, couponCode, paymentMethod } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || cart.items.length === 0) throw new AppError('سبد خرید شما خالی است', 400);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const orderItems = [];
    let itemsPrice = 0;

    // بررسی و کاهش موجودی به‌صورت اتمیک (جلوگیری از overselling)
    for (const cartItem of cart.items) {
      const product = await Product.findById(cartItem.product._id).session(session);
      const variant = product.variants.id(cartItem.variantId);

      if (!variant || variant.stock < cartItem.quantity) {
        throw new AppError(`موجودی «${product.name}» کافی نیست`, 400);
      }

      variant.stock -= cartItem.quantity;
      await product.save({ session });

      orderItems.push({
        product: product._id,
        variantId: variant._id,
        name: product.name,
        color: variant.color,
        size: variant.size,
        quantity: cartItem.quantity,
        price: cartItem.price,
      });
      itemsPrice += cartItem.price * cartItem.quantity;
    }

    // اعمال کد تخفیف در صورت وجود
    let discountAmount = 0;
    let couponId = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() }).session(session);
      if (coupon) {
        const check = coupon.isValid(itemsPrice);
        if (check.valid) {
          discountAmount =
            coupon.discountType === 'percent'
              ? (itemsPrice * coupon.discountValue) / 100
              : coupon.discountValue;
          if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, coupon.maxDiscount);
          coupon.usedCount += 1;
          await coupon.save({ session });
          couponId = coupon._id;
        }
      }
    }

    const shippingPrice = itemsPrice > 1000000 ? 0 : 50000; // نمونه قانون هزینه ارسال
    const taxPrice = Math.round(itemsPrice * 0.09); // نمونه ۹٪ مالیات بر ارزش افزوده
    const totalPrice = itemsPrice + shippingPrice + taxPrice - discountAmount;

    const [order] = await Order.create(
      [
        {
          user: req.user._id,
          items: orderItems,
          shippingAddress,
          itemsPrice,
          shippingPrice,
          taxPrice,
          discountAmount,
          totalPrice,
          coupon: couponId,
          paymentMethod: paymentMethod || 'zarinpal',
          status: 'pending_payment',
          statusHistory: [{ status: 'pending_payment' }],
        },
      ],
      { session }
    );

    cart.items = [];
    await cart.save({ session });

    await session.commitTransaction();
    session.endSession();

    // TODO: اینجا کاربر به درگاه پرداخت (زرین‌پال/آی‌دی‌پی) هدایت می‌شود
    // و پس از verify شدن تراکنش، isPaid=true و status='processing' ست می‌شود.

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});

// @route  GET /api/orders/my-orders
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
  res.json({ success: true, data: orders });
});

// @route  GET /api/orders/:id
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('سفارش یافت نشد', 404);

  const isOwner = order.user.toString() === req.user._id.toString();
  const isAdmin = ['admin', 'manager'].includes(req.user.role);
  if (!isOwner && !isAdmin) throw new AppError('اجازه دسترسی به این سفارش را ندارید', 403);

  res.json({ success: true, data: order });
});

// @route  PUT /api/orders/:id/cancel
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('سفارش یافت نشد', 404);
  if (order.user.toString() !== req.user._id.toString()) {
    throw new AppError('اجازه دسترسی به این سفارش را ندارید', 403);
  }
  if (!['pending_payment', 'processing'].includes(order.status)) {
    throw new AppError('این سفارش دیگر قابل لغو نیست', 400);
  }

  // بازگرداندن موجودی محصولات
  for (const item of order.items) {
    await Product.updateOne(
      { _id: item.product, 'variants._id': item.variantId },
      { $inc: { 'variants.$.stock': item.quantity } }
    );
  }

  order.status = 'cancelled';
  order.statusHistory.push({ status: 'cancelled' });
  await order.save();

  res.json({ success: true, data: order });
});

// @route  GET /api/orders (admin) - لیست همه سفارش‌ها
const getAllOrders = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const orders = await Order.find(filter).populate('user', 'name email').sort('-createdAt');
  res.json({ success: true, count: orders.length, data: orders });
});

// @route  PUT /api/orders/:id/status (admin)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('سفارش یافت نشد', 404);

  order.status = status;
  order.statusHistory.push({ status });
  if (status === 'processing' && !order.isPaid) order.isPaid = true;
  await order.save();

  // TODO: ارسال پیامک/ایمیل اطلاع‌رسانی تغییر وضعیت به کاربر

  res.json({ success: true, data: order });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
};
