# API دستیار هوشمند شوشترجوان

این Worker برای سایت GitHub Pages یک بک‌اند امن فراهم می‌کند. کلید Gemini فقط در Secret سمت سرور نگهداری می‌شود.

## فایل‌ها
- `worker.js`: بازیابی اسناد دانشنامه و پرونده آثار تاریخی، سپس تولید پاسخ فارسی محاوره‌ای با Gemini.
- مدل پیش‌فرض: `gemini-3.8-flash`.
- GET: بررسی سلامت سرویس.
- POST: بدنه `{"question":"...","history":[]}`.

## راه‌اندازی
1. در Cloudflare یک Worker بساز و محتوای `worker.js` را در آن قرار بده.
2. در Settings > Variables and Secrets یک Secret با نام `GEMINI_API_KEY` بساز.
3. کلید را از Google AI Studio بگیر و مستقیم در فیلد Secret قرار بده؛ هرگز آن را در GitHub یا فایل‌های سایت نگذار.
4. آدرس Worker باید در فرانت‌اند سایت تنظیم شود تا گفتگوها به API برسند.
5. دسترسی مدل `gemini-3.8-flash` را برای کلیدت بررسی کن.

GitHub Pages بک‌اند اجرا نمی‌کند؛ برای پاسخ‌گویی واقعی، Worker باید یک‌بار در حساب Cloudflare منتشر و Secret در آن تنظیم شود.
