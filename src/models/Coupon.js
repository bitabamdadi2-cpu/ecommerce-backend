const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ['percent', 'fixed'], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minPurchase: { type: Number, default: 0 },
    maxDiscount: { type: Number }, // سقف تخفیف برای نوع percent
    expiresAt: { type: Date, required: true },
    usageLimit: { type: Number, default: 1 },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

couponSchema.methods.isValid = function (cartTotal) {
  if (!this.isActive) return { valid: false, reason: 'کد تخفیف غیرفعال است' };
  if (this.expiresAt < new Date()) return { valid: false, reason: 'کد تخفیف منقضی شده است' };
  if (this.usedCount >= this.usageLimit)
    return { valid: false, reason: 'ظرفیت استفاده از این کد تمام شده است' };
  if (cartTotal < this.minPurchase)
    return { valid: false, reason: `حداقل مبلغ خرید برای این کد ${this.minPurchase} تومان است` };
  return { valid: true };
};

module.exports = mongoose.model('Coupon', couponSchema);
