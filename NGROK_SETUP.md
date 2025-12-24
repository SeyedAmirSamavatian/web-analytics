# راه‌اندازی ngrok برای تست در سایت واقعی

## نصب ngrok

1. دانلود از: https://ngrok.com/download
2. یا با npm: `npm install -g ngrok`

## استفاده

1. Backend را روی localhost:3000 اجرا کنید:
   ```bash
   cd backend
   npm run dev
   ```

2. در ترمینال جدید، ngrok را اجرا کنید:
   ```bash
   ngrok http 3000
   ```

3. یک URL مثل این دریافت می‌کنید:
   ```
   Forwarding: https://abc123.ngrok.io -> http://localhost:3000
   ```

4. در سایت خود از این کد استفاده کنید:
   ```html
   <script 
     src="https://abc123.ngrok.io/tracker.js" 
     data-key="YOUR_TRACKING_KEY"
     data-api="https://abc123.ngrok.io">
   </script>
   ```

**نکات:**
- URL ngrok در هر بار اجرا تغییر می‌کند (در نسخه رایگان)
- برای URL ثابت، باید نسخه پولی ngrok را خریداری کنید
- فقط برای تست و توسعه مناسب است

