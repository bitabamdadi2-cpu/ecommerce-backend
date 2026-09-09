# طرح کامل پروژه فروشگاه اینترنتی (Node.js + MongoDB)

## ۱. معرفی و هدف پروژه

این سند، نقشه راه کامل ساخت یک فروشگاه اینترنتی تک‌فروشنده (Single-vendor) با بک‌اند Node.js (Express) و دیتابیس MongoDB (Mongoose) است. هدف، ارائه یک محصول واقعی و قابل استقرار (production-ready) است که هم برای پورتفولیو و هم برای راه‌اندازی یک کسب‌وکار واقعی قابل استفاده باشد.

فرانت‌اند در این سند پوشش داده نمی‌شود؛ بک‌اند به‌صورت یک REST API طراحی شده که با هر فرانت‌اندی (React، Next.js، اپ موبایل) قابل اتصال است.

## ۲. پشته فناوری (Tech Stack)

| لایه | فناوری | دلیل انتخاب |
|---|---|---|
| زبان | Node.js (v20+) | اکوسیستم بزرگ، مناسب I/O سنگین فروشگاه |
| فریم‌ورک | Express.js | سبک، منعطف، استاندارد صنعت |
| دیتابیس | MongoDB + Mongoose | مدل‌سازی انعطاف‌پذیر محصولات با ویژگی‌های متغیر |
| احراز هویت | JWT + bcrypt | stateless، مقیاس‌پذیر |
| اعتبارسنجی ورودی | Joi یا Zod | جلوگیری از داده نامعتبر و حملات injection |
| آپلود فایل | Multer + Cloudinary/S3 | ذخیره تصاویر خارج از سرور اصلی |
| کش | Redis | کش کاتالوگ، session، rate limiting |
| صف کار | BullMQ (روی Redis) | ایمیل، اعلان‌ها، پردازش async |
| پرداخت | زرین‌پال / آی‌دی‌پی (یا Stripe برای بین‌المللی) | تراکنش امن |
| مستندسازی API | Swagger (OpenAPI) | راحتی توسعه تیمی و تست |
| تست | Jest + Supertest | تضمین کیفیت |
| لاگ | Winston / Morgan | ردیابی خطا در production |
| Containerization | Docker + docker-compose | استقرار یکسان در همه محیط‌ها |

## ۳. ویژگی‌های کامل پروژه

### ۳.۱ احراز هویت و کاربران
- ثبت‌نام و ورود با ایمیل/شماره موبایل و رمز عبور (bcrypt hash)
- ورود با OTP پیامکی (اختیاری، رایج در ایران)
- Refresh Token + Access Token (JWT) برای امنیت بهتر
- فراموشی و بازیابی رمز عبور از طریق ایمیل
- نقش‌های کاربری: `customer`, `admin`, `manager`
- ویرایش پروفایل، آدرس‌های متعدد، لیست علاقه‌مندی‌ها

### ۳.۲ کاتالوگ محصولات
- دسته‌بندی چندسطحی (Category / Subcategory) با ساختار درختی
- محصولات با ویژگی‌های متغیر (variant): رنگ، سایز، قیمت و موجودی مجزا برای هر ترکیب
- تصاویر متعدد برای هر محصول
- جستجوی متنی (MongoDB Text Index) + فیلتر بر اساس قیمت، برند، دسته، امتیاز
- صفحه‌بندی (pagination)، مرتب‌سازی (جدیدترین، ارزان‌ترین، پرفروش‌ترین)
- مدیریت موجودی real-time با MongoDB Transactions برای جلوگیری از overselling

### ۳.۳ سبد خرید و لیست علاقه‌مندی
- سبد خرید برای کاربر مهمان (guest، ذخیره در localStorage سمت فرانت + merge بعد از ورود) و کاربر لاگین‌شده (ذخیره در دیتابیس)
- به‌روزرسانی خودکار قیمت و موجودی هنگام مشاهده سبد

### ۳.۴ فرایند خرید (Checkout)
- محاسبه خودکار مالیات، هزینه ارسال بر اساس شهر/وزن
- اعمال کد تخفیف (Coupon) با شرایط: حداقل مبلغ خرید، تاریخ انقضا، محدودیت تعداد استفاده
- اتصال به درگاه پرداخت با callback و verify تراکنش
- ثبت سفارش فقط پس از تایید پرداخت (idempotency برای جلوگیری از سفارش تکراری)

### ۳.۵ مدیریت سفارش
- وضعیت‌های سفارش: در انتظار پرداخت → پرداخت‌شده → در حال پردازش → ارسال‌شده → تحویل‌شده → لغو/مرجوعی
- تاریخچه سفارش برای کاربر
- اعلان ایمیل/پیامک در تغییر وضعیت سفارش
- امکان لغو سفارش توسط کاربر پیش از ارسال

### ۳.۶ نظرات و امتیازدهی
- ثبت نظر و امتیاز فقط برای کاربرانی که محصول را خریده‌اند (verified purchase)
- پاسخ فروشنده به نظرات
- محاسبه خودکار میانگین امتیاز محصول

### ۳.۷ پنل مدیریت (Admin)
- مدیریت کامل محصولات، دسته‌ها، موجودی
- مدیریت سفارش‌ها و تغییر وضعیت
- مدیریت کاربران (مسدودسازی، تغییر نقش)
- مدیریت کدهای تخفیف
- داشبورد آماری: فروش روزانه/ماهانه، پرفروش‌ترین محصولات، نرخ تبدیل

### ۳.۸ امنیت
- Rate limiting روی endpoint های حساس (ورود، ثبت‌نام)
- Helmet.js برای هدرهای امنیتی HTTP
- اعتبارسنجی کامل ورودی‌ها (جلوگیری از NoSQL Injection و XSS)
- HTTPS اجباری در production
- لاگ کردن تلاش‌های ورود ناموفق

### ۳.۹ ویژگی‌های تمایزبخش (فاز دوم)
- پیشنهاد محصولات مشابه ("کسانی که این را خریدند...")
- اعلان موجودی مجدد (Back in stock notification)
- PWA / اپ موبایل
- چند فروشنده‌ای (Multi-vendor) در صورت نیاز به گسترش

## ۴. ساختار پوشه‌های پروژه

```
ecommerce-backend/
├── src/
│   ├── config/
│   │   └── db.js                # اتصال به MongoDB
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Category.js
│   │   ├── Cart.js
│   │   ├── Order.js
│   │   ├── Review.js
│   │   └── Coupon.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── categoryController.js
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   ├── reviewController.js
│   │   ├── couponController.js
│   │   └── userController.js
│   ├── routes/
│   │   └── ... (یک فایل روت به ازای هر ماژول)
│   ├── middlewares/
│   │   ├── auth.js              # احراز هویت و بررسی نقش
│   │   ├── errorHandler.js      # مدیریت متمرکز خطا
│   │   ├── asyncHandler.js      # wrapper برای catch خطای async
│   │   └── rateLimiter.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── apiFeatures.js       # فیلتر/مرتب‌سازی/صفحه‌بندی
│   ├── app.js                   # تنظیمات Express
│   └── server.js                # نقطه ورود اجرا
├── docs/
│   └── PROJECT_PLAN.md
├── .env.example
├── .gitignore
└── package.json
```

## ۵. مدل‌های دیتابیس (خلاصه schema)

**User**: name, email, password (hash), phone, role, addresses[], wishlist[]

**Category**: name, slug, parent (self-reference برای درخت دسته‌بندی)

**Product**: name, slug, description, category, brand, images[], basePrice, variants[{sku, color, size, price, stock}], ratingsAverage, ratingsCount, isActive

**Cart**: user (یا guestId), items[{product, variant, quantity, price}]

**Order**: user, items[], shippingAddress, paymentInfo, itemsPrice, shippingPrice, taxPrice, totalPrice, status, coupon

**Review**: user, product, rating, comment, isVerifiedPurchase

**Coupon**: code, discountType(percent/fixed), discountValue, minPurchase, expiresAt, usageLimit, usedCount

## ۶. لیست کامل API Endpoint ها

### Auth — `/api/auth`
- `POST /register` — ثبت‌نام
- `POST /login` — ورود
- `POST /refresh-token` — دریافت access token جدید
- `POST /forgot-password`
- `POST /reset-password/:token`
- `GET /me` — دریافت پروفایل کاربر لاگین‌شده 🔒

### Users — `/api/users` 🔒(admin)
- `GET /` — لیست کاربران
- `GET /:id`
- `PUT /:id` — ویرایش نقش/وضعیت
- `DELETE /:id`

### Categories — `/api/categories`
- `GET /` — لیست همه دسته‌ها (درختی)
- `POST /` 🔒(admin)
- `PUT /:id` 🔒(admin)
- `DELETE /:id` 🔒(admin)

### Products — `/api/products`
- `GET /` — لیست با فیلتر/جستجو/صفحه‌بندی (`?category=&minPrice=&maxPrice=&search=&sort=&page=`)
- `GET /:slug` — جزئیات یک محصول
- `POST /` 🔒(admin)
- `PUT /:id` 🔒(admin)
- `DELETE /:id` 🔒(admin)

### Cart — `/api/cart` 🔒
- `GET /`
- `POST /items` — افزودن به سبد
- `PUT /items/:itemId` — تغییر تعداد
- `DELETE /items/:itemId`
- `DELETE /` — خالی کردن سبد

### Orders — `/api/orders` 🔒
- `POST /` — ثبت سفارش از روی سبد
- `GET /my-orders`
- `GET /:id`
- `PUT /:id/cancel`
- `GET /` 🔒(admin) — همه سفارش‌ها
- `PUT /:id/status` 🔒(admin)

### Reviews — `/api/products/:productId/reviews`
- `GET /`
- `POST /` 🔒 (فقط خریداران تایید‌شده)
- `DELETE /:id` 🔒(admin یا نویسنده)

### Coupons — `/api/coupons`
- `POST /apply` 🔒 — اعتبارسنجی و اعمال کد تخفیف
- `GET /` 🔒(admin)
- `POST /` 🔒(admin)
- `DELETE /:id` 🔒(admin)

## ۷. نقشه راه توسعه (Roadmap پیشنهادی)

1. **هفته ۱**: راه‌اندازی اسکلت پروژه، اتصال MongoDB، مدل User، سیستم احراز هویت کامل
2. **هفته ۲**: مدل‌های Category و Product، CRUD کامل، جستجو و فیلتر
3. **هفته ۳**: سبد خرید، فرایند Checkout، اتصال درگاه پرداخت
4. **هفته ۴**: مدیریت سفارش، نظرات، کدهای تخفیف
5. **هفته ۵**: پنل ادمین (endpoint های آماری)، تست‌نویسی، مستندسازی Swagger
6. **هفته ۶**: بهینه‌سازی (کش Redis)، Docker، استقرار (deploy) روی VPS یا Railway/Render

## ۸. نکات استقرار (Deployment)

- استفاده از PM2 یا Docker برای اجرای پایدار در production
- متغیرهای محیطی حساس (JWT_SECRET, DB_URI, درگاه پرداخت) هرگز در کد commit نشوند
- فعال‌سازی MongoDB Atlas برای دیتابیس مدیریت‌شده در ابر (پشتیبان‌گیری خودکار)
- تنظیم CORS دقیق برای دامنه فرانت‌اند
- مانیتورینگ با ابزارهایی مانند UptimeRobot یا Sentry برای ردیابی خطا

---

این سند به همراه یک اسکلت کد کارکردی (Node.js + Express + MongoDB) با پیاده‌سازی احراز هویت، محصولات، سبد خرید، سفارش، نظرات و کدهای تخفیف در همین پروژه ارائه شده تا نقطه شروع واقعی برای توسعه باشد.
