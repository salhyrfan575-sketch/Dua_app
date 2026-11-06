# راه‌اندازی مغز هوشمند شوشترجوان (رایگان)

این پروژه از Cloudflare Workers AI استفاده می‌کند؛ سایت GitHub Pages کلید محرمانه ندارد و درخواست‌ها از Worker عبور می‌کنند.

## پیش‌نیاز
- حساب رایگان Cloudflare
- مخزن GitHub همین پروژه
- هیچ کارت بانکی یا خرید اشتراک برای سهمیه رایگان Workers AI لازم نیست؛ سهمیه فعلی ۱۰٬۰۰۰ Neurons در روز است. بعد از تمام‌شدن سهمیه روزانه، پاسخ‌گویی مدل تا زمان بازنشانی سهمیه متوقف می‌شود.

## استقرار Worker با گوشی (بدون نصب برنامه)

۱. وارد داشبورد Cloudflare شو و یک حساب رایگان بساز یا وارد حساب شو.
۲. از بخش Workers & Pages گزینه Create application و سپس Import an existing Git repository را انتخاب کن.
۳. حساب GitHub را وصل کن و مخزن `salhyrfan575-sketch/Dua_app` را انتخاب کن.
۴. اگر تنظیمات ساخت نمایش داده شد، پوشه اصلی مخزن را انتخاب کن؛ فایل `wrangler.toml` در همان پوشه است. فرمان انتشار `npx wrangler deploy) است. سپس Deploy را بزن.
۵. بعد از انتشار، آدرس Worker با پسوند `.workers.dev` نمایش داده می‌شود. آن را کپی کن.

فایل `wrangler.toml` از قبل اتصال Workers AI با نام `AI` را تعریف کرده است؛ اگر داشبورد درخواست افزودن Binding کرد، نوع Workers AI و نام متغیر `AI` را انتخاب کن.

اگر Import مخزن در حساب نمایش داده نشد، از مسیر Workers & Pages > Create application > Hello World یک Worker بساز، وارد Edit Code شو و محتوای فایل `worker.js` را جایگزین کد نمونه کن؛ سپس در Settings > Bindings یک Workers AI binding با نام `AI` اضافه کن و Deploy بزن.

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
