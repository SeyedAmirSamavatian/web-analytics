#!/bin/bash

echo "=== راه‌اندازی Backend ==="
echo ""

# رفتن به دایرکتوری backend
cd /var/www/monitorsite/backend || exit 1

echo "1. بررسی فایل .env..."
if [ ! -f ".env" ]; then
    echo "❌ فایل .env موجود نیست!"
    exit 1
fi

echo "✅ فایل .env موجود است"
echo ""

echo "2. بررسی NODE_ENV..."
if grep -q "NODE_ENV=development" .env; then
    echo "⚠️  NODE_ENV=development است. برای production باید production باشد."
    echo "   در حال تغییر به production..."
    sed -i 's/NODE_ENV=development/NODE_ENV=production/' .env
    echo "✅ NODE_ENV به production تغییر یافت"
else
    echo "✅ NODE_ENV درست است"
fi
echo ""

echo "3. بررسی node_modules..."
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules موجود نیست. در حال نصب..."
    npm install
else
    echo "✅ node_modules موجود است"
fi
echo ""

echo "4. Build کردن Backend..."
npm run build
echo ""

echo "5. بررسی PM2..."
if ! command -v pm2 &> /dev/null; then
    echo "⚠️  PM2 نصب نیست. در حال نصب..."
    npm install -g pm2
else
    echo "✅ PM2 نصب است"
fi
echo ""

echo "6. متوقف کردن process قبلی (اگر وجود دارد)..."
pm2 delete web-analytics-backend 2>/dev/null || true
echo ""

echo "7. راه‌اندازی Backend با PM2..."
pm2 start npm --name "web-analytics-backend" -- start
pm2 save
echo ""

echo "8. نمایش وضعیت..."
pm2 status
echo ""

echo "9. نمایش لاگ‌ها (10 خط آخر)..."
pm2 logs web-analytics-backend --lines 10 --nostream
echo ""

echo "10. تست Backend..."
sleep 2
curl -s http://127.0.0.1:3000/health && echo "" || echo "❌ Backend پاسخ نمی‌دهد!"
echo ""

echo "=== راه‌اندازی کامل شد ==="
echo ""
echo "برای مشاهده لاگ‌ها: pm2 logs web-analytics-backend"
echo "برای مشاهده وضعیت: pm2 status"
echo "برای restart: pm2 restart web-analytics-backend"

