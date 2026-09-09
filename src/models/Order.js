const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: String, // snapshot نام محصول در لحظه خرید
    color: String,
    size: String,
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    shippingAddress: {
      province: String,
      city: String,
      street: String,
      postalCode: String,
      receiverPhone: String,
    },
    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true, default: 0 },
    taxPrice: { type: Number, required: true, default: 0 },
    discountAmount: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
    paymentMethod: { type: String, enum: ['zarinpal', 'idpay', 'cod'], default: 'zarinpal' },
    paymentResult: {
      authority: String,
      refId: String,
      paidAt: Date,
    },
    isPaid: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['pending_payment', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
      default: 'pending_payment',
    },
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
