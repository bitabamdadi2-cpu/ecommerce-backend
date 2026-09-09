const mongoose = require('mongoose');
const slugify = require('slugify');

// هر ترکیب رنگ/سایز به‌صورت جداگانه قیمت و موجودی دارد
const variantSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true },
    color: String,
    size: String,
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'نام محصول الزامی است'], trim: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    brand: String,
    images: [{ type: String }],
    basePrice: { type: Number, required: true, min: 0 },
    variants: [variantSchema],
    ratingsAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingsCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    tags: [String],
  },
  { timestamps: true }
);

// ایندکس متنی برای جستجوی سریع
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });

// موجودی کل محصول (مجموع همه واریانت‌ها) - فیلد مجازی
productSchema.virtual('totalStock').get(function () {
  if (!this.variants || this.variants.length === 0) return 0;
  return this.variants.reduce((sum, v) => sum + v.stock, 0);
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true }) + '-' + Date.now().toString(36);
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
