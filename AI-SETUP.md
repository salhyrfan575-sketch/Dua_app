# راه‌اندازی مغز هوشمند شوشترجوان (رایگان)

این پروژه از Cloudflare Workers AI استفاده می‌کند؛ سایت GitHub Pages کلید محرمانه ندارد و درخواست‌ها از Worker عبور می‌کنند.

## پیش‌نیاز
- حساب رایگان Cloudflare
- مخزن GitHub همین پروژه
- هیچ کارت بانکی یا خرید اشتراک برای سهمیه رایگان Workers AI لازم نیست؛ سهمیه فعلی ۱۰٬۰۰۰ Neurons در روز است. بعد از تمام‌شدن سهمیه روزانه، پاسخ‌گویی مدل تا زمان بازنشانی سهمیه متوقف می‌شود.

## استقرار Worker
۱. در Cloudflare وارد Workers & Pages شو و یک Worker با نام `shoushtarjavan-ai` بساز.
۲. فایل `worker.js` همین مخزن را در ویرایشگر Worker قرار بده و Deploy را بزن.
۳. در تنظیمات Worker به بخش Bindings برو، یک binding از نوع Workers AI با نام متغیر `AI` اضافه کن و ذخیره کن.
۴. آدرس Worker معمولاً شبیه `https://shoushtarjavan-ai.<account-subdomain>.workers.dev` است.

## اتصال به سایت
در فایل `data/ai-config.json` مقدار `endpoint` را با آدرس Worker خودت جایگزین کن؛ انتهای آدرس مسیر اضافه نکن. تغییر را در GitHub ذخیره کن. پس از انتشار GitHub Pages، دستیار سایت از مدل زبانی استفاده می‌کند.

## نکات
- مدل انتخابی: `@cf/meta/llama-3.3-70b-instruct-fp8-fast`.
- دانشنامه شوشتر در هر درخواست به‌عنوان زمینه مرتبط بازیابی می‌شود؛ پرسش‌های عمومی هم به خود مدل فرستاده می‌شوند.
- تاریخچه کوتاه مکالمه فقط در همان صفحه مرورگر نگه داشته می‌شود.
- کلید محرمانه‌ای در کد سایت قرار نمی‌گیرد.
- سهمیه رایگان و مدل‌های در دسترس ممکن است از طرف Cloudflare تغییر کنند. عبور از سهمیه رایگان باعث هزینه خودکار نمی‌شود؛ درخواست‌ها محدود/رد می‌شوند مگر آنکه حساب به طرح پولی ارتقا داده شود.
- این نسخه جست‌وجوی زنده اینترنت ندارد و نباید ادعا کند اخبار لحظه‌ای را بررسی کرده است.

## منابع رسمی
- https://developers.cloudflare.com/workers-ai/platform/pricing/
- https://developers.cloudflare.com/workers-ai/get-started/workers-wrangler/
- https://developers.cloudflare.com/workers-ai/get-started/workers-ai-binding/
