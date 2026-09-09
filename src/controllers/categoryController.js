const asyncHandler = require('../middlewares/asyncHandler');
const { AppError } = require('../middlewares/errorHandler');
const Category = require('../models/Category');

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).lean();

  // ساخت ساختار درختی از لیست تخت
  const map = {};
  categories.forEach((c) => (map[c._id] = { ...c, children: [] }));
  const tree = [];
  categories.forEach((c) => {
    if (c.parent) {
      map[c.parent]?.children.push(map[c._id]);
    } else {
      tree.push(map[c._id]);
    }
  });

  res.json({ success: true, data: tree });
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, data: category });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) throw new AppError('دسته‌بندی یافت نشد', 404);
  res.json({ success: true, data: category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new AppError('دسته‌بندی یافت نشد', 404);
  res.json({ success: true, message: 'دسته‌بندی حذف شد' });
});

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
