const { AppError } = require('./errorHandler');

// میدل‌ور عمومی برای اجرای اعتبارسنجی Joi روی body
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const message = error.details.map((d) => d.message).join(', ');
    return next(new AppError(message, 400));
  }
  next();
};

module.exports = validate;
