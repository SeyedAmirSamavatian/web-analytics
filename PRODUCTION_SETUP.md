# راهنمای تنظیمات Production

## تنظیمات Frontend

### 1. تنظیم متغیر محیطی API URL

در production، باید URL backend را در فایل `.env` تنظیم کنید:

```env
VITE_API_URL=https://api.monitorsite.info
```

یا اگر backend در همان domain است:

```env
VITE_API_URL=
```

### 2. تنظیمات Tracker.js

برای استفاده از tracker.js در سایت‌های مشتری:

#### اگر Backend در همان Domain است:
```html
<script src="https://www.monitorsite.info/tracker.js" 
        data-key="YOUR_TRACKING_KEY"></script>
```

#### اگر Backend در Domain/Subdomain دیگری است:
```html
<script src="https://www.monitorsite.info/tracker.js" 
        data-key="YOUR_TRACKING_KEY"
        data-api="https://api.monitorsite.info"></script>
```

## تنظیمات Backend

### 1. تنظیم CORS

در فایل `.env` backend:

```env
FRONTEND_URL=https://www.monitorsite.info
```

یا اگر چند domain دارید، در `backend/src/index.ts` لیست origins را به‌روزرسانی کنید.

### 2. تنظیمات ClickHouse و MySQL

اطمینان حاصل کنید که تمام تنظیمات database در `.env` درست هستند.

## Build برای Production

### Frontend:
```bash
cd frontend
npm run build
```

فایل‌های build در `frontend/dist` قرار می‌گیرند.

### Backend:
```bash
cd backend
npm run build
npm start
```

## نکات مهم:

1. **Tracker.js**: در production، tracker.js باید از CDN یا همان domain سرو شود
2. **CORS**: مطمئن شوید که CORS برای domain های production تنظیم شده است
3. **HTTPS**: در production حتماً از HTTPS استفاده کنید
4. **Environment Variables**: هرگز فایل `.env` را commit نکنید

## Troubleshooting

### خطای 502 Bad Gateway

اگر خطای `502 Bad Gateway` دریافت می‌کنید:

1. **بررسی کنید که Backend در حال اجرا است:**
   ```bash
   # بررسی process
   ps aux | grep node
   # یا در Windows
   tasklist | findstr node
   ```

2. **بررسی لاگ‌های Backend:**
   - بررسی کنید که آیا backend crash کرده است
   - بررسی خطاهای ClickHouse یا MySQL

3. **بررسی تنظیمات Proxy/Nginx:**
   - اگر از Nginx استفاده می‌کنید، مطمئن شوید که proxy_pass به درستی تنظیم شده است
   - بررسی کنید که backend روی پورت درست در حال listen است

4. **بررسی CORS:**
   - مطمئن شوید که `FRONTEND_URL` در `.env` backend تنظیم شده است
   - یا اینکه CORS middleware برای track endpoint تمام origins را می‌پذیرد

5. **بررسی Health Endpoint:**
   ```bash
   curl https://www.monitorsite.info/health
   # یا
   curl https://api.monitorsite.info/health
   ```

### خطای ERR_CONNECTION_REFUSED

اگر خطای `ERR_CONNECTION_REFUSED` دریافت می‌کنید:

1. **بررسی URL در tracker.js:**
   - مطمئن شوید که `data-api` attribute درست تنظیم شده است
   - یا اینکه tracker.js از `window.location.origin` استفاده می‌کند

2. **بررسی که Backend در دسترس است:**
   - تست کنید که backend روی URL درست در حال اجرا است
   - بررسی firewall و security groups

