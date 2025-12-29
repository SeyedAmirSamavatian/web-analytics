#!/bin/bash

echo "=== تست Track Endpoint ==="
echo ""

# ابتدا باید یک tracking key معتبر داشته باشیم
# اما برای تست می‌توانیم با یک key تستی امتحان کنیم

echo "1. تست Track Endpoint (بدون tracking key معتبر - باید 400 یا 404 بدهد):"
curl -X POST http://127.0.0.1:3000/api/analytics/track \
  -H "Content-Type: application/json" \
  -d '{
    "trackingKey": "test-key",
    "visitorId": "test-visitor-123",
    "pageUrl": "/test-page",
    "referrer": "https://example.com",
    "durationSec": 10
  }'
echo ""
echo ""

echo "2. تست Track Endpoint از طریق Nginx:"
curl -X POST https://www.monitorsite.info/api/analytics/track \
  -H "Content-Type: application/json" \
  -d '{
    "trackingKey": "test-key",
    "visitorId": "test-visitor-123",
    "pageUrl": "/test-page",
    "referrer": "https://example.com",
    "durationSec": 10
  }'
echo ""
echo ""

echo "3. بررسی لاگ‌های Nginx (آخرین 5 خط):"
sudo tail -5 /var/log/nginx/error.log
echo ""

echo "=== تست کامل شد ==="
echo ""
echo "اگر خطای 404 دریافت کردید، یعنی tracking key معتبر نیست (که طبیعی است)"
echo "اگر خطای 502 دریافت کردید، یعنی مشکلی در proxy وجود دارد"
echo "اگر خطای 200 دریافت کردید، یعنی همه چیز کار می‌کند!"

