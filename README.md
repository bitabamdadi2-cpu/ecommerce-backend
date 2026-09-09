# فروشگاه اینترنتی — Backend (Node.js + Express + MongoDB)

اسکلت کد کارکردی بک‌اند فروشگاه اینترنتی. برای طرح کامل ویژگی‌ها، معماری و لیست کامل API ها فایل `docs/PROJECT_PLAN.md` را ببینید.

## راه‌اندازی سریع

```bash
# نصب پکیج‌ها
npm install

# ساخت فایل env
cp .env.example .env
# مقادیر MONGO_URI و JWT_SECRET را در .env تنظیم کنید

# اجرا در حالت توسعه (با نودمون)
npm run dev

# اجرا در حالت عادی
npm start
```

سرور روی `http://localhost:5000` بالا می‌آید. تست سلامت سرور:

```bash
curl http://localhost:5000/api/health
```

## مستندات Swagger

بعد از بالا آمدن سرور، مستندات کامل و تعاملی API در آدرس زیر در دسترس است:

```
http://localhost:5000/api-docs
```

از همین صفحه می‌توانید با دکمه **Authorize** توکن دریافتی از `/auth/login` را به‌صورت `Bearer <accessToken>` وارد کنید و مسیرهای نیازمند ورود را مستقیماً از داخل مرورگر تست کنید.

خروجی خام سند OpenAPI (برای Import در Postman/Insomnia یا هر ابزار دیگر) هم در دسترس است:

```
http://localhost:5000/api-docs.json
```

فایل منبع سند هم در `docs/openapi.yaml` قرار دارد و با هر ویرایشی در endpoint ها باید به‌روزرسانی شود.

## چطور API را با هم‌تیمی فرانت‌اند به اشتراک بگذارم؟

سه مسیر رایج وجود دارد، بسته به اینکه پروژه در چه مرحله‌ای است:

**۱. تست سریع و موقت (وقتی هنوز چیزی دیپلوی نشده)**
سرور را لوکال بالا بیاورید (`npm run dev`) و با ابزار [ngrok](https://ngrok.com) یک آدرس عمومی موقت بسازید:
```bash
ngrok http 5000
```
آدرسی مثل `https://xxxx.ngrok-free.app` می‌گیرید که تا وقتی سیستم شما روشن و سرور اجراست کار می‌کند. لینک `https://xxxx.ngrok-free.app/api-docs` را برای دوستتان بفرستید. مناسب تست چند ساعته، نه کار مداوم — چون با هر بار ری‌استارت آدرس عوض می‌شود و تا وقتی سیستم شما خاموش است در دسترس نیست.

**۲. دیپلوی رایگان (پیشنهاد اصلی برای همکاری مداوم)**
پروژه را روی یک سرویس رایگان مثل Render یا Railway دیپلوی کنید تا یک آدرس ثابت داشته باشید که همیشه در دسترس است، مستقل از روشن بودن سیستم شما:
1. پروژه را در یک ریپازیتوری گیت‌هاب push کنید.
2. یک دیتابیس رایگان در [MongoDB Atlas](https://www.mongodb.com/atlas) بسازید و `MONGO_URI` آن را بگیرید.
3. در Render/Railway یک Web Service جدید از روی ریپازیتوری بسازید، متغیرهای `.env` (به‌خصوص `MONGO_URI` و `JWT_SECRET`) را در تنظیمات محیطی سرویس وارد کنید.
4. بعد از دیپلوی، آدرسی مثل `https://your-app.onrender.com/api-docs` می‌گیرید که همیشه در دسترس دوستتان است.
5. آدرس `servers` در `docs/openapi.yaml` را هم به همین دامنه به‌روزرسانی کنید تا تست از داخل Swagger UI مستقیم کار کند.

**۳. اشتراک فقط مستندات (بدون نیاز به اجرای سرور)**
اگر فرانت‌کار فقط می‌خواهد ساختار درخواست‌ها و پاسخ‌ها را ببیند (نه لزوماً به سرور واقعی وصل شود)، کافیست فایل `docs/openapi.yaml` یا خروجی `/api-docs.json` را برایش بفرستید؛ می‌تواند آن را در Postman (`Import > File`) یا [Swagger Editor آنلاین](https://editor.swagger.io) باز کند.

برای شروع کار روزمره پیشنهاد می‌شود مسیر ۲ (دیپلوی رایگان) را انتخاب کنید چون هم شما هم دوستتان بدون وابستگی به روشن بودن سیستم یکدیگر کار می‌کنید.

## نمونه استفاده از API

```bash
# ثبت‌نام
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"زهرا","email":"zahra@example.com","password":"12345678"}'

# ورود
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"zahra@example.com","password":"12345678"}'

# استفاده از accessToken دریافتی برای درخواست‌های نیازمند ورود
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <accessToken>"
```

## ماژول‌های پیاده‌سازی‌شده

- احراز هویت کامل (ثبت‌نام، ورود، refresh token، فراموشی/بازیابی رمز عبور)
- مدیریت کاربران و نقش‌ها (customer/admin/manager)
- دسته‌بندی درختی محصولات
- محصولات با واریانت (رنگ/سایز/قیمت/موجودی جداگانه) + جستجو، فیلتر، صفحه‌بندی
- سبد خرید
- ثبت سفارش با تراکنش اتمیک MongoDB (جلوگیری از overselling)، محاسبه مالیات/ارسال/تخفیف
- کدهای تخفیف
- نظرات و امتیازدهی با تایید خرید واقعی (verified purchase)
- میدل‌ورهای امنیتی: helmet، rate limiting، mongo-sanitize، xss-clean
- مستندات کامل و تعاملی Swagger/OpenAPI روی مسیر `/api-docs`

## مواردی که باید خودتان تکمیل کنید (TODO)

- اتصال واقعی به درگاه پرداخت (زرین‌پال/آی‌دی‌پی) در `orderController.js`
- سرویس ارسال ایمیل/پیامک (Nodemailer یا سرویس OTP) برای `forgotPassword` و اطلاع‌رسانی سفارش
- آپلود تصویر محصولات با Multer + Cloudinary/S3
- تست‌های خودکار با Jest/Supertest
- مستندسازی Swagger
