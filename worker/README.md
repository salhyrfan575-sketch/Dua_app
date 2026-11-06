# دستیار پژوهشی شوشترجوان

این Worker واسط امن بین سایت GitHub Pages و Gemini API است. کلید API فقط باید در Cloudflare به‌صورت Secret ذخیره شود؛ هرگز آن را در مخزن یا فایل‌های سایت قرار ندهید.

## راه‌اندازی
1. در Cloudflare یک Worker بسازید و محتوای `index.js` را در آن قرار دهید.
2. در Settings → Variables and Secrets یک Secret با نام `GEMINI_API_KEY` بسازید و کلید Google AI Studio را همان‌جا وارد کنید.
3. Worker را Deploy کنید.
4. نشانی Worker را در فایل `index.html` در متغیر `SHUSHTAR_AI_ENDPOINT` قرار دهید.
5. فایل دانشنامه `data/shushtar-knowledge.json` از GitHub Pages بارگیری می‌شود و مرورگر حداکثر شش سند مرتبط را برای پاسخ به Worker می‌فرستد.

## ملاحظات
- API Key در مرورگر منتشر نمی‌شود.
- پرسش کاربر و بخش‌های مرتبط دانشنامه برای تولید پاسخ به Google Gemini ارسال می‌شوند.
- در سهمیه رایگان Google، داده‌های ارسالی ممکن است برای بهبود محصولات Google استفاده شوند؛ پیش از استفاده عمومی، سیاست حریم خصوصی و شرایط روز Google را بررسی کنید.
- نسخه اولیه، مجموعه‌ای محدود از اسناد دارای منبع است؛ دانشنامه هنوز کامل نیست.
- برای انتشار عمومی، محدودیت نرخ درخواست، پایش سوءاستفاده و سیاست نگهداری داده را در لایه Worker اضافه کنید.
- این Worker فقط با دانش ارائه‌شده در درخواست پاسخ می‌دهد و در صورت نبود سند کافی باید از پاسخ قطعی خودداری کند.

## منابع اصلی نسخه اولیه
- UNESCO World Heritage Centre: https://whc.unesco.org/en/list/1315/
- UNESCO nomination and ICOMOS documents: https://whc.unesco.org/en/list/1315/documents/
- ICID: https://www.icid-ciid.org/award/his_details/115
