#!/bin/bash

echo "=== بررسی وضعیت Backend ==="
echo ""
echo "1. بررسی Process های Node.js:"
ps aux | grep node | grep -v grep
echo ""

echo "2. بررسی PM2 (اگر استفاده می‌کنید):"
pm2 list 2>/dev/null || echo "PM2 نصب نیست یا در حال اجرا نیست"
echo ""

echo "3. تست مستقیم Backend:"
curl -s http://127.0.0.1:3000/health || echo "❌ Backend در حال اجرا نیست!"
echo ""

echo "4. بررسی پورت 3000:"
sudo netstat -tlnp | grep 3000 || echo "❌ پورت 3000 در حال listen نیست!"
echo ""

echo "5. آخرین خطاهای Nginx:"
sudo tail -10 /var/log/nginx/error.log
echo ""

echo "6. بررسی فایل .env:"
if [ -f "/var/www/monitorsite/backend/.env" ]; then
    echo "✅ فایل .env موجود است"
    grep -E "PORT|NODE_ENV|FRONTEND_URL" /var/www/monitorsite/backend/.env
else
    echo "❌ فایل .env موجود نیست!"
fi
echo ""

echo "=== اگر Backend در حال اجرا نیست، دستورات زیر را اجرا کنید: ==="
echo ""
echo "cd /var/www/monitorsite/backend"
echo "pm2 start npm --name 'web-analytics-backend' -- start"
echo "pm2 save"
echo ""

