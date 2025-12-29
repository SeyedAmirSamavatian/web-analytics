# راهنمای تنظیمات Nginx

## نصب و پیکربندی

### 1. کپی کردن فایل تنظیمات

```bash
sudo cp nginx.conf /etc/nginx/sites-available/monitorsite.info
sudo ln -s /etc/nginx/sites-available/monitorsite.info /etc/nginx/sites-enabled/
```

### 2. ایجاد دایرکتوری‌های مورد نیاز

```bash
# دایرکتوری frontend build
sudo mkdir -p /var/www/monitorsite/frontend/dist

# دایرکتوری public برای tracker.js
sudo mkdir -p /var/www/monitorsite/backend/public

# دایرکتوری fonts
sudo mkdir -p /var/www/monitorsite/frontend/public/fonts
```

### 3. کپی فایل‌های Frontend Build

```bash
# بعد از build کردن frontend
cd /var/www/monitorsite/frontend
npm run build

# کپی tracker.js از backend
sudo cp /var/www/monitorsite/backend/public/tracker.js /var/www/monitorsite/backend/public/

# کپی fonts (اگر دارید)
sudo cp -r /var/www/monitorsite/frontend/public/fonts/* /var/www/monitorsite/frontend/public/fonts/
```

### 4. تنظیم مجوزها

```bash
sudo chown -R www-data:www-data /var/www/monitorsite
sudo chmod -R 755 /var/www/monitorsite
```

### 5. تست تنظیمات Nginx

```bash
sudo nginx -t
```

### 6. Restart Nginx

```bash
sudo systemctl restart nginx
```

## تنظیمات Backend

اطمینان حاصل کنید که backend روی `localhost:3000` در حال اجرا است:

```bash
cd backend
npm run build
npm start
```

یا با PM2:

```bash
pm2 start npm --name "web-analytics-backend" -- start
pm2 save
```

## تنظیمات SSL (اگر هنوز انجام نشده)

```bash
sudo certbot --nginx -d monitorsite.info -d www.monitorsite.info
```

## بررسی وضعیت

### بررسی Nginx:
```bash
sudo systemctl status nginx
```

### بررسی Backend:
```bash
curl http://localhost:3000/health
```

### بررسی از خارج:
```bash
curl https://www.monitorsite.info/health
curl https://www.monitorsite.info/api/health
```

## Troubleshooting

### بررسی لاگ‌های Nginx:
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### بررسی Backend:
```bash
# اگر از PM2 استفاده می‌کنید
pm2 logs web-analytics-backend

# یا لاگ‌های مستقیم
tail -f /path/to/backend/logs
```

### مشکل 502 Bad Gateway:

این خطا معمولاً به این معنی است که nginx نمی‌تواند به backend متصل شود.

**مراحل بررسی:**

1. **بررسی کنید که backend در حال اجرا است:**
   ```bash
   # بررسی process
   ps aux | grep node
   # یا
   pm2 list
   
   # تست مستقیم backend
   curl http://127.0.0.1:3000/health
   curl http://127.0.0.1:3000/api/health
   ```

2. **بررسی لاگ‌های nginx:**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

3. **بررسی که backend روی پورت 3000 listen می‌کند:**
   ```bash
   sudo netstat -tlnp | grep 3000
   # یا
   sudo ss -tlnp | grep 3000
   ```

4. **بررسی firewall:**
   ```bash
   # اگر از ufw استفاده می‌کنید
   sudo ufw status
   ```

5. **بررسی تنظیمات backend:**
   - مطمئن شوید که backend روی `0.0.0.0` یا `127.0.0.1` listen می‌کند (نه فقط `localhost`)
   - در فایل `.env` backend، `PORT=3000` را تنظیم کنید

6. **اگر از PM2 استفاده می‌کنید:**
   ```bash
   # بررسی وضعیت
   pm2 status
   
   # بررسی لاگ‌ها
   pm2 logs web-analytics-backend
   
   # restart
   pm2 restart web-analytics-backend
   ```

7. **تست proxy از nginx:**
   ```bash
   # از سرور خودتان تست کنید
   curl -H "Host: www.monitorsite.info" http://127.0.0.1/api/health
   ```

### مشکل CORS:
- مطمئن شوید که header های CORS در nginx configuration اضافه شده‌اند
- بررسی کنید که backend هم CORS را درست handle می‌کند

## نکات مهم:

1. **Backend باید روی localhost:3000 در حال اجرا باشد** (یا پورت دیگری که در nginx.conf تنظیم کرده‌اید)
2. **Frontend build باید در `/var/www/monitorsite.info/dist` باشد**
3. **Tracker.js باید در `/var/www/monitorsite.info/public/tracker.js` باشد**
4. **بعد از هر تغییر در nginx.conf، حتماً `sudo nginx -t` و سپس `sudo systemctl reload nginx` را اجرا کنید**

