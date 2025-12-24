# راهنمای Deploy کردن Web Analytics Platform

## گزینه‌های Deploy

### 1. VPS (Virtual Private Server)
- **پیشنهاد:** DigitalOcean, Linode, Vultr, Hetzner
- **هزینه:** از $5-10 در ماه
- **کنترل کامل:** بله

### 2. Cloud Platforms
- **Heroku:** ساده اما محدودیت‌های رایگان
- **Railway:** مناسب برای شروع
- **Render:** رایگان برای شروع
- **Fly.io:** مناسب برای Node.js

### 3. Serverless
- **Vercel:** برای Frontend
- **AWS Lambda:** برای Backend (پیچیده‌تر)

## مراحل Deploy روی VPS

### 1. آماده‌سازی سرور

```bash
# اتصال به سرور
ssh root@your-server-ip

# نصب Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# نصب MySQL
apt-get update
apt-get install -y mysql-server

# نصب ClickHouse
# طبق مستندات رسمی ClickHouse
```

### 2. Clone پروژه

```bash
git clone your-repo-url
cd web-analytics
```

### 3. تنظیم Backend

```bash
cd backend
npm install
npm run build

# ایجاد فایل .env
nano .env
```

محتوای `.env`:
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-very-secure-secret-key

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=web_analytics
MYSQL_USER=analytics_user
MYSQL_PASSWORD=secure-password

CLICKHOUSE_HOST=localhost
CLICKHOUSE_PORT=8123
CLICKHOUSE_DATABASE=web_analytics
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=
```

### 4. تنظیم MySQL

```sql
CREATE DATABASE web_analytics;
CREATE USER 'analytics_user'@'localhost' IDENTIFIED BY 'secure-password';
GRANT ALL PRIVILEGES ON web_analytics.* TO 'analytics_user'@'localhost';
FLUSH PRIVILEGES;
```

### 5. استفاده از PM2 برای مدیریت Process

```bash
npm install -g pm2

# اجرای Backend
cd backend
pm2 start dist/index.js --name analytics-backend
pm2 save
pm2 startup
```

### 6. تنظیم Nginx (Reverse Proxy)

```bash
apt-get install -y nginx
nano /etc/nginx/sites-available/analytics
```

محتوای فایل:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Tracker.js
    location /tracker.js {
        proxy_pass http://localhost:3000;
    }

    # Frontend (اگر build کرده‌اید)
    location / {
        root /var/www/analytics-frontend;
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/analytics /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 7. Deploy Frontend

```bash
cd frontend
npm install
npm run build

# کپی فایل‌های build شده
cp -r dist/* /var/www/analytics-frontend/
```

### 8. تنظیم SSL (HTTPS)

```bash
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

## استفاده در سایت

بعد از deploy، در سایت خود از این کد استفاده کنید:

```html
<script 
  src="https://your-domain.com/tracker.js" 
  data-key="YOUR_TRACKING_KEY"
  data-api="https://your-domain.com">
</script>
```

## نکات امنیتی

1. **JWT_SECRET:** از یک secret قوی استفاده کنید
2. **Database Passwords:** از رمزهای عبور قوی استفاده کنید
3. **Firewall:** فقط پورت‌های لازم را باز کنید
4. **SSL:** همیشه از HTTPS استفاده کنید
5. **Rate Limiting:** برای جلوگیری از abuse اضافه کنید

