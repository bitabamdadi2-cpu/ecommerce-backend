const asyncHandler = require('../middlewares/asyncHandler');
const { AppError } = require('../middlewares/errorHandler');
const User = require('../models/User');

// @route  GET /api/users (admin)
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort('-createdAt');
  res.json({ success: true, count: users.length, data: users });
});

// @route  GET /api/users/:id (admin)
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('کاربر یافت نشد', 404);
  res.json({ success: true, data: user });
});

// @route  PUT /api/users/:id (admin) - تغییر نقش یا مسدودسازی
const updateUser = asyncHandler(async (req, res) => {
  const { role, isBlocked } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { ...(role && { role }), ...(isBlocked !== undefined && { isBlocked }) },
    { new: true, runValidators: true }
  );
  if (!user) throw new AppError('کاربر یافت نشد', 404);
  res.json({ success: true, data: user });
});

// @route  DELETE /api/users/:id (admin)
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new AppError('کاربر یافت نشد', 404);
  res.json({ success: true, message: 'کاربر حذف شد' });
});

// @route  PUT /api/users/me/profile - ویرایش پروفایل خود کاربر
const updateMyProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { ...(name && { name }), ...(phone && { phone }) },
    { new: true, runValidators: true }
  );
  res.json({ success: true, data: user });
});

// @route  POST /api/users/me/addresses
const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses.push(req.body);
  await user.save();
  res.status(201).json({ success: true, data: user.addresses });
});

module.exports = { getUsers, getUserById, updateUser, deleteUser, updateMyProfile, addAddress };
