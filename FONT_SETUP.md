# راهنمای تنظیم فونت Vazir

## مشکل:

CSS به فونت‌های `Vazir-Bold.woff2`, `Vazir-Medium.woff2` و غیره نیاز دارد اما این فایل‌ها موجود نیستند.

## راه حل فعلی:

CSS را تغییر دادیم تا از فونت اصلی `Vazir.woff2` برای تمام وزن‌ها استفاده کند. مرورگر به صورت خودکار وزن‌های مختلف را synthesize می‌کند.

## راه حل بهتر (اختیاری):

اگر می‌خواهید فونت‌های واقعی Bold و Medium را استفاده کنید:

### 1. دانلود فونت‌های Vazir:

از سایت رسمی Vazir فونت‌ها را دانلود کنید:
- https://github.com/rastikerdar/vazir-font

یا از CDN:
- https://cdn.jsdelivr.net/gh/rastikerdar/vazir-font@latest/dist/

### 2. کپی فایل‌های فونت:

```bash
# در سرور
cd /var/www/monitorsite/frontend/public/fonts

# دانلود فونت‌های مورد نیاز
wget https://github.com/rastikerdar/vazir-font/raw/master/dist/Vazir-Bold.woff2
wget https://github.com/rastikerdar/vazir-font/raw/master/dist/Vazir-Bold.woff
wget https://github.com/rastikerdar/vazir-font/raw/master/dist/Vazir-Medium.woff2
wget https://github.com/rastikerdar/vazir-font/raw/master/dist/Vazir-Medium.woff
wget https://github.com/rastikerdar/vazir-font/raw/master/dist/Vazir-Light.woff2
wget https://github.com/rastikerdar/vazir-font/raw/master/dist/Vazir-Light.woff
```

### 3. بازگرداندن CSS به حالت اصلی:

بعد از اضافه کردن فایل‌ها، می‌توانید CSS را به حالت اصلی برگردانید (اگر می‌خواهید از فونت‌های واقعی استفاده کنید).

## نکته:

راه حل فعلی (استفاده از فونت اصلی برای تمام وزن‌ها) برای اکثر موارد کافی است و نیازی به فایل‌های اضافی نیست.

