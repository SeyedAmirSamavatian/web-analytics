#!/bin/bash

echo "=== تست Nginx Proxy Configuration ==="
echo ""

echo "1. تست مستقیم Backend (بدون nginx):"
curl -X POST http://127.0.0.1:3000/api/analytics/track \
  -H "Content-Type: application/json" \
  -d '{"trackingKey":"test","visitorId":"test","pageUrl":"/test"}' \
  -v 2>&1 | grep -E "(HTTP|error|Invalid)"
echo ""

echo "2. تست از طریق Nginx (localhost):"
curl -X POST http://127.0.0.1/api/analytics/track \
  -H "Content-Type: application/json" \
  -H "Host: www.monitorsite.info" \
  -d '{"trackingKey":"test","visitorId":"test","pageUrl":"/test"}' \
  -v 2>&1 | grep -E "(HTTP|error|Invalid)"
echo ""

echo "3. تست از طریق HTTPS:"
curl -X POST https://www.monitorsite.info/api/analytics/track \
  -H "Content-Type: application/json" \
  -d '{"trackingKey":"test","visitorId":"test","pageUrl":"/test"}' \
  -v 2>&1 | grep -E "(HTTP|error|Invalid)"
echo ""

echo "4. بررسی لاگ‌های Nginx:"
sudo tail -5 /var/log/nginx/error.log
echo ""

echo "5. بررسی access log:"
sudo tail -5 /var/log/nginx/access.log | grep track
echo ""

