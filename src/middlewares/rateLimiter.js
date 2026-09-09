const rateLimit = require('express-rate-limit');

// محدودسازی تلاش‌های ورود/ثبت‌نام برای جلوگیری از brute-force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // ۱۵ دقیقه
  max: 10,
  message: {
    success: false,
    message: 'تعداد تلاش‌های شما بیش از حد مجاز است، بعدا دوباره امتحان کنید',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// محدودسازی عمومی برای کل API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, apiLimiter };
