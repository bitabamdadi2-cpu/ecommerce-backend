const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    isVerifiedPurchase: { type: Boolean, default: false },
    sellerReply: { type: String },
  },
  { timestamps: true }
);

// هر کاربر فقط یک نظر برای هر محصول می‌تواند ثبت کند
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// بعد از هر ذخیره/حذف، میانگین امتیاز محصول را به‌روزرسانی کن
reviewSchema.statics.recalculateProductRating = async function (productId) {
  const Product = mongoose.model('Product');
  const stats = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  await Product.findByIdAndUpdate(productId, {
    ratingsAverage: stats[0]?.avgRating || 0,
    ratingsCount: stats[0]?.count || 0,
  });
};

reviewSchema.post('save', function () {
  this.constructor.recalculateProductRating(this.product);
});

module.exports = mongoose.model('Review', reviewSchema);
