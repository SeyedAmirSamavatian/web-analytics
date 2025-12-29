# راهنمای رفع خطای 502 Bad Gateway

## مشکل: `POST https://www.monitorsite.info/api/analytics/track 502 (Bad Gateway)`

این خطا به این معنی است که nginx نمی‌تواند به backend متصل شود.

## مراحل بررسی و رفع مشکل:

### 1. بررسی وضعیت Backend

```bash
# بررسی process
ps aux | grep node
# یا اگر از PM2 استفاده می‌کنید
pm2 list
pm2 logs web-analytics-backend
```

### 2. تست مستقیم Backend

```bash
# تست health endpoint
curl http://127.0.0.1:3000/health
curl http://127.0.0.1:3000/api/health

# تست track endpoint
curl -X POST http://127.0.0.1:3000/api/analytics/track \
  -H "Content-Type: application/json" \
  -d '{"trackingKey":"test","visitorId":"test","pageUrl":"/test"}'
```

**اگر این دستورات کار نکردند، backend در حال اجرا نیست یا مشکل دارد.**

### 3. بررسی پورت 3000

```bash
# بررسی که پورت 3000 در حال listen است
sudo netstat -tlnp | grep 3000
# یا
sudo ss -tlnp | grep 3000
```

### 4. بررسی لاگ‌های Nginx

```bash
# مشاهده خطاهای nginx
sudo tail -f /var/log/nginx/error.log

# مشاهده access log
sudo tail -f /var/log/nginx/access.log
```

### 5. راه‌اندازی Backend

اگر backend در حال اجرا نیست:

```bash
cd /var/www/monitorsite/backend

# با npm
npm run build
npm start

# یا با PM2 (توصیه می‌شود)
pm2 start npm --name "web-analytics-backend" -- start
pm2 save
pm2 startup  # برای راه‌اندازی خودکار بعد از reboot
```

### 6. بررسی تنظیمات Backend

در فایل `/var/www/monitorsite/backend/.env`:

```env
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://www.monitorsite.info
```

### 7. بررسی Firewall

```bash
# اگر از ufw استفاده می‌کنید
sudo ufw status

# پورت 3000 نباید از خارج قابل دسترسی باشد (فقط localhost)
# nginx از داخل سرور به آن دسترسی دارد
```

### 8. تست از طریق Nginx

```bash
# تست health endpoint از طریق nginx
curl https://www.monitorsite.info/health
curl https://www.monitorsite.info/api/health

# تست track endpoint
curl -X POST https://www.monitorsite.info/api/analytics/track \
  -H "Content-Type: application/json" \
  -d '{"trackingKey":"YOUR_KEY","visitorId":"test","pageUrl":"/test"}'
```

### 9. بررسی مسیرهای فایل

مطمئن شوید که:

- Frontend build در `/var/www/monitorsite/frontend/dist` است
- Tracker.js در `/var/www/monitorsite/backend/public/tracker.js` است
- Backend در `/var/www/monitorsite/backend` است

### 10. Restart Nginx

بعد از هر تغییر در nginx.conf:

```bash
# تست تنظیمات
sudo nginx -t

# اگر تست موفق بود، reload
sudo systemctl reload nginx
# یا
sudo systemctl restart nginx
```

## نکات مهم:

1. **Backend باید روی `127.0.0.1:3000` یا `0.0.0.0:3000` listen کند**
2. **Nginx از `127.0.0.1:3000` به backend متصل می‌شود**
3. **پورت 3000 نباید از خارج قابل دسترسی باشد** (فقط از طریق nginx)
4. **اگر از PM2 استفاده می‌کنید، مطمئن شوید که بعد از reboot خودکار راه‌اندازی می‌شود**

## اگر هنوز مشکل دارید:

1. لاگ‌های backend را بررسی کنید
2. لاگ‌های nginx را بررسی کنید
3. مطمئن شوید که backend crash نمی‌کند
4. بررسی کنید که ClickHouse و MySQL در دسترس هستند

