const crypto = require('crypto');
const asyncHandler = require('../middlewares/asyncHandler');
const { AppError } = require('../middlewares/errorHandler');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');

// @route  POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new AppError('کاربری با این ایمیل قبلا ثبت‌نام کرده است', 400);

  const user = await User.create({ name, email, password, phone });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res.status(201).json({
    success: true,
    data: { id: user._id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  });
});

// @route  POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('ایمیل یا رمز عبور اشتباه است', 401);
  }
  if (user.isBlocked) throw new AppError('حساب کاربری شما مسدود شده است', 403);

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res.json({
    success: true,
    data: { id: user._id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  });
});

// @route  POST /api/auth/refresh-token
const refreshToken = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) throw new AppError('توکن ارسال نشده است', 400);

  const jwt = require('jsonwebtoken');
  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) throw new AppError('کاربر یافت نشد', 401);

  const accessToken = generateAccessToken(user._id);
  res.json({ success: true, accessToken });
});

// @route  GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

// @route  POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    // برای جلوگیری از افشای وجود/عدم وجود ایمیل، پاسخ یکسان می‌دهیم
    return res.json({ success: true, message: 'در صورت وجود این ایمیل، لینک بازیابی ارسال شد' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = Date.now() + 15 * 60 * 1000; // ۱۵ دقیقه
  await user.save({ validateBeforeSave: false });

  // TODO: ارسال ایمیل حاوی resetToken با سرویس ایمیل (Nodemailer/SendGrid)
  res.json({
    success: true,
    message: 'در صورت وجود این ایمیل، لینک بازیابی ارسال شد',
    ...(process.env.NODE_ENV === 'development' && { resetToken }), // فقط برای تست local
  });
});

// @route  POST /api/auth/reset-password/:token
const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) throw new AppError('توکن نامعتبر یا منقضی شده است', 400);

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json({ success: true, message: 'رمز عبور با موفقیت تغییر کرد' });
});

module.exports = { register, login, refreshToken, getMe, forgotPassword, resetPassword };
