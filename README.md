# Web Analytics Platform

یک پلتفرم کامل آنالیتیکس وب به صورت Full-Stack با ساختار Back-End مبتنی بر Express.js و Front-End مبتنی بر React (با Vite).

## ویژگی‌ها

- ✅ احراز هویت کامل (ثبت‌نام و ورود)
- ✅ مدیریت سایت‌ها با Tracking Key منحصر به فرد
- ✅ ذخیره‌سازی داده‌های ترافیک در ClickHouse برای تحلیل سریع
- ✅ داشبورد زیبا با نمودارها و آمار پیشرفته
- ✅ اسکریپت تِرکینگ برای سایت‌های مشتری
- ✅ نمایش آمار لحظه‌ای (Active Users)
- ✅ نمودارهای تعاملی با Recharts
- ✅ UI/UX مدرن با Tailwind CSS و Framer Motion

## ساختار پروژه

```
web-analytics/
├── backend/          # Express.js + TypeScript
│   ├── src/
│   │   ├── controllers/
│   │   ├── database/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   └── public/       # tracker.js
└── frontend/         # React + Vite + TypeScript
    └── src/
        ├── components/
        ├── pages/
        ├── api/
        └── store/
```

## پیش‌نیازها

- Node.js (v18 یا بالاتر)
- MySQL (v8.0 یا بالاتر)
- ClickHouse (v23 یا بالاتر)
- npm یا yarn

## نصب و راه‌اندازی

### 1. نصب وابستگی‌های Backend

```bash
cd backend
npm install
```

### 2. تنظیم فایل .env برای Backend

فایل `.env` را در پوشه `backend` ایجاد کنید:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# MySQL Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=web_analytics
MYSQL_USER=root
MYSQL_PASSWORD=your-mysql-password

# ClickHouse Configuration
CLICKHOUSE_HOST=localhost
CLICKHOUSE_PORT=8123
CLICKHOUSE_DATABASE=web_analytics
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=
```

### 3. راه‌اندازی MySQL

```sql
CREATE DATABASE web_analytics;
```

مدل‌های Sequelize به صورت خودکار جداول را ایجاد می‌کنند.

### 4. راه‌اندازی ClickHouse

ClickHouse باید روی پورت 8123 در حال اجرا باشد. دیتابیس و جدول به صورت خودکار ایجاد می‌شوند.

### 5. اجرای Backend

```bash
cd backend
npm run dev
```

Backend روی `http://localhost:3000` اجرا می‌شود.

### 6. نصب وابستگی‌های Frontend

```bash
cd frontend
npm install
```

### 7. تنظیم فایل .env برای Frontend (اختیاری)

فایل `.env` را در پوشه `frontend` ایجاد کنید:

```env
VITE_API_URL=http://localhost:3000
```

### 8. اجرای Frontend

```bash
cd frontend
npm run dev
```

Frontend روی `http://localhost:5173` اجرا می‌شود.

## استفاده از اسکریپت تِرکینگ

پس از افزودن سایت در داشبورد، یک Tracking Key دریافت می‌کنید. اسکریپت زیر را در سایت خود قرار دهید:

```html
<script src="http://localhost:3000/tracker.js" data-key="YOUR_TRACKING_KEY"></script>
```

یا برای استفاده از API سفارشی:

```html
<script src="http://localhost:3000/tracker.js" data-key="YOUR_TRACKING_KEY" data-api="http://localhost:3000"></script>
```

## API Endpoints

### احراز هویت
- `POST /api/auth/register` - ثبت‌نام
- `POST /api/auth/login` - ورود

### مدیریت سایت‌ها
- `POST /api/user/site/add` - افزودن سایت جدید
- `GET /api/user/site/list` - دریافت لیست سایت‌ها

### آنالیتیکس
- `POST /api/analytics/track` - ثبت رویداد ترافیک
- `GET /api/analytics/dashboard/:siteId` - دریافت آمار داشبورد

## ساختار دیتابیس

### MySQL (Users & Sites)
- `users`: اطلاعات کاربران
- `sites`: اطلاعات سایت‌ها

### ClickHouse (Traffic Events)
- `traffic_events`: رویدادهای ترافیک با ساختار بهینه برای تحلیل سریع

## تکنولوژی‌های استفاده شده

### Backend
- Express.js
- TypeScript
- Sequelize (MySQL ORM)
- @clickhouse/client
- JWT Authentication
- Joi Validation
- Helmet Security

### Frontend
- React 18
- Vite
- TypeScript
- Tailwind CSS
- Recharts
- Framer Motion
- Zustand (State Management)
- Axios
- React Router

## توسعه

برای ساخت پروژه:

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## مجوز

ISC

