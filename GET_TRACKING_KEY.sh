#!/bin/bash

echo "=== دریافت Tracking Key از دیتابیس ==="
echo ""

# خواندن تنظیمات از .env
if [ -f "/var/www/monitorsite/backend/.env" ]; then
    source /var/www/monitorsite/backend/.env
else
    echo "❌ فایل .env پیدا نشد!"
    exit 1
fi

# اگر MYSQL_USER و MYSQL_PASSWORD در .env نیستند، از کاربر بپرسید
if [ -z "$MYSQL_USER" ] || [ -z "$MYSQL_PASSWORD" ]; then
    echo "⚠️  MYSQL_USER یا MYSQL_PASSWORD در .env تنظیم نشده است."
    echo "لطفاً دستی وارد کنید:"
    read -p "MySQL User: " MYSQL_USER
    read -sp "MySQL Password: " MYSQL_PASSWORD
    echo ""
fi

MYSQL_DATABASE=${MYSQL_DATABASE:-web_analytics}
MYSQL_HOST=${MYSQL_HOST:-localhost}
MYSQL_PORT=${MYSQL_PORT:-3306}

echo "1. اتصال به دیتابیس و دریافت tracking key..."
echo ""

# دریافت اولین tracking key
TRACKING_KEY=$(mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" \
  -se "SELECT trackingKey FROM sites LIMIT 1;" 2>/dev/null)

if [ -z "$TRACKING_KEY" ]; then
    echo "❌ هیچ tracking key در دیتابیس پیدا نشد!"
    echo ""
    echo "برای ایجاد یک tracking key:"
    echo "1. به https://www.monitorsite.info بروید"
    echo "2. لاگین کنید"
    echo "3. یک سایت اضافه کنید"
    echo "4. tracking key را از داشبورد کپی کنید"
    exit 1
fi

echo "✅ Tracking Key پیدا شد:"
echo "$TRACKING_KEY"
echo ""

echo "2. تست Track Endpoint با این tracking key..."
echo ""

curl -X POST https://www.monitorsite.info/api/analytics/track \
  -H "Content-Type: application/json" \
  -d "{
    \"trackingKey\": \"$TRACKING_KEY\",
    \"visitorId\": \"test-visitor-$(date +%s)\",
    \"pageUrl\": \"/test-page\",
    \"referrer\": \"https://example.com\",
    \"durationSec\": 10
  }"

echo ""
echo ""

echo "=== اگر موفق بودید (200 OK)، یعنی همه چیز کار می‌کند! ==="

