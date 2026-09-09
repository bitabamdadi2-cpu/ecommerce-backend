// کلاس خطای سفارشی برای خطاهای قابل پیش‌بینی (404، 400، 401 و ...)
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// میدل‌ور متمرکز مدیریت خطا - باید آخرین میدل‌ور در app.js باشد
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'خطای داخلی سرور';

  // خطای شناسه نامعتبر MongoDB
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `شناسه نامعتبر: ${err.value}`;
  }

  // خطای duplicate key (مثلا ایمیل تکراری)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0];
    message = `مقدار وارد شده برای «${field}» تکراری است`;
  }

  // خطای اعتبارسنجی Mongoose
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  // خطای JWT
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'توکن نامعتبر است';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'توکن منقضی شده است، دوباره وارد شوید';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

const notFound = (req, res, next) => {
  next(new AppError(`مسیر یافت نشد: ${req.originalUrl}`, 404));
};

module.exports = { AppError, errorHandler, notFound };
