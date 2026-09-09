const asyncHandler = require('../middlewares/asyncHandler');
const { AppError } = require('../middlewares/errorHandler');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

// @route  GET /api/cart
const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  await cart.populate('items.product', 'name images slug');
  res.json({ success: true, data: cart });
});

// @route  POST /api/cart/items
const addItem = asyncHandler(async (req, res) => {
  const { productId, variantId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) throw new AppError('محصول یافت نشد', 404);

  const variant = product.variants.id(variantId);
  if (!variant) throw new AppError('نوع (واریانت) انتخاب‌شده یافت نشد', 404);
  if (variant.stock < quantity) throw new AppError('موجودی کافی نیست', 400);

  const cart = await getOrCreateCart(req.user._id);
  const existingItem = cart.items.find(
    (i) => i.product.toString() === productId && i.variantId.toString() === variantId
  );

  if (existingItem) {
    existingItem.quantity += Number(quantity);
  } else {
    cart.items.push({ product: productId, variantId, quantity, price: variant.price });
  }

  await cart.save();
  await cart.populate('items.product', 'name images slug');
  res.status(201).json({ success: true, data: cart });
});

// @route  PUT /api/cart/items/:itemId
const updateItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await getOrCreateCart(req.user._id);

  const item = cart.items.id(req.params.itemId);
  if (!item) throw new AppError('آیتم در سبد یافت نشد', 404);

  if (quantity <= 0) {
    item.deleteOne();
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  res.json({ success: true, data: cart });
});

// @route  DELETE /api/cart/items/:itemId
const removeItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = cart.items.filter((i) => i._id.toString() !== req.params.itemId);
  await cart.save();
  res.json({ success: true, data: cart });
});

// @route  DELETE /api/cart
const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  await cart.save();
  res.json({ success: true, data: cart });
});

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
