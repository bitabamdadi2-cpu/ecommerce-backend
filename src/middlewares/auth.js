const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const { AppError } = require('./errorHandler');
const User = require('../models/User');

// بررسی ورود کاربر با JWT
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    throw new AppError('برای دسترسی به این بخش باید وارد شوید', 401);
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select('-password');

  if (!user) {
    throw new AppError('کاربر مرتبط با این توکن یافت نشد', 401);
  }
  if (user.isBlocked) {
    throw new AppError('حساب کاربری شما مسدود شده است', 403);
  }

  req.user = user;
  next();
});

// محدود کردن دسترسی بر اساس نقش، مثال: authorize('admin', 'manager')
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    throw new AppError('شما اجازه دسترسی به این بخش را ندارید', 403);
  }
  next();
};

module.exports = { protect, authorize };
