require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`🚀 سرور روی پورت ${PORT} در حالت ${process.env.NODE_ENV} اجرا شد`);
  });

  // مدیریت خطاهای پیش‌بینی‌نشده (مثلا قطع اتصال دیتابیس)
  process.on('unhandledRejection', (err) => {
    console.error(`❌ Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
};

startServer();
