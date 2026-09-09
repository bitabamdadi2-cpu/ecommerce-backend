const asyncHandler = require('../middlewares/asyncHandler');
const { AppError } = require('../middlewares/errorHandler');
const Product = require('../models/Product');
const ApiFeatures = require('../utils/apiFeatures');

// @route  GET /api/products
const getProducts = asyncHandler(async (req, res) => {
  const baseQuery = Product.find({ isActive: true }).populate('category', 'name slug');

  const features = new ApiFeatures(baseQuery, req.query)
    .filter()
    .search(['name', 'description', 'tags'])
    .sort()
    .limitFields();

  const total = await Product.countDocuments(features.query.getFilter());
  features.paginate();

  const products = await features.query;

  res.json({
    success: true,
    count: products.length,
    total,
    page: features.pagination.page,
    pages: Math.ceil(total / features.pagination.limit),
    data: products,
  });
});

// @route  GET /api/products/:slug
const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate(
    'category',
    'name slug'
  );
  if (!product) throw new AppError('محصول یافت نشد', 404);
  res.json({ success: true, data: product });
});

// @route  POST /api/products (admin)
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, data: product });
});

// @route  PUT /api/products/:id (admin)
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) throw new AppError('محصول یافت نشد', 404);
  res.json({ success: true, data: product });
});

// @route  DELETE /api/products/:id (admin) - soft delete
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) throw new AppError('محصول یافت نشد', 404);
  res.json({ success: true, message: 'محصول غیرفعال شد' });
});

module.exports = { getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct };
