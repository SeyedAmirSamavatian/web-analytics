# راهنمای نصب و راه‌اندازی

## مراحل نصب

### 1. نصب MySQL

MySQL را نصب و راه‌اندازی کنید. سپس دیتابیس را ایجاد کنید:

```sql
CREATE DATABASE web_analytics;
```

### 2. نصب ClickHouse

ClickHouse را نصب کنید. برای Windows می‌توانید از Docker استفاده کنید یا نسخه Native را نصب کنید.

**نکته:** پروژه از Docker استفاده نمی‌کند، اما برای نصب ClickHouse می‌توانید از Docker استفاده کنید:

```bash
docker run -d -p 8123:8123 -p 9000:9000 --name clickhouse-server clickhouse/clickhouse-server
```

### 3. تنظیم Backend

```bash
cd backend
npm install
```

فایل `.env` را ایجاد کنید:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=web_analytics
MYSQL_USER=root
MYSQL_PASSWORD=your-password

CLICKHOUSE_HOST=localhost
CLICKHOUSE_PORT=8123
CLICKHOUSE_DATABASE=web_analytics
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=
```

### 4. راه‌اندازی Backend

```bash
npm run dev
```

Backend روی `http://localhost:3000` اجرا می‌شود.

### 5. تنظیم Frontend

```bash
cd frontend
npm install
```

(اختیاری) فایل `.env` را ایجاد کنید:

```env
VITE_API_URL=http://localhost:3000
```

### 6. راه‌اندازی Frontend

```bash
npm run dev
```

Frontend روی `http://localhost:5173` اجرا می‌شود.

## استفاده

1. مرورگر را باز کنید و به `http://localhost:5173` بروید
2. یک حساب کاربری ایجاد کنید
3. سایت خود را اضافه کنید
4. Tracking Key را دریافت کنید
5. اسکریپت تِرکینگ را در سایت خود قرار دهید
6. آمار را در داشبورد مشاهده کنید

## عیب‌یابی

### مشکل اتصال به MySQL
- مطمئن شوید MySQL در حال اجرا است
- اطلاعات اتصال در `.env` را بررسی کنید
- دیتابیس `web_analytics` را ایجاد کرده باشید

### مشکل اتصال به ClickHouse
- مطمئن شوید ClickHouse در حال اجرا است
- پورت 8123 باز است
- اطلاعات اتصال در `.env` را بررسی کنید

### مشکل CORS
- مطمئن شوید Backend روی پورت 3000 و Frontend روی پورت 5173 اجرا می‌شود
- تنظیمات CORS در `backend/src/index.ts` را بررسی کنید

