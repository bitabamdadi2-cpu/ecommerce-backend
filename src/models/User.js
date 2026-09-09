const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema(
  {
    title: { type: String, default: 'خانه' },
    province: String,
    city: String,
    street: String,
    postalCode: String,
    receiverPhone: String,
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'نام الزامی است'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'ایمیل الزامی است'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'فرمت ایمیل معتبر نیست'],
    },
    phone: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'رمز عبور الزامی است'],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ['customer', 'admin', 'manager'],
      default: 'customer',
    },
    addresses: [addressSchema],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    isBlocked: { type: Boolean, default: false },
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true }
);

// هش کردن رمز عبور قبل از ذخیره
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
