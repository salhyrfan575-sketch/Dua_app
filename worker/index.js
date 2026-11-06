const SITE_ORIGIN = "https://salhyrfan575-sketch.github.io";
const cors = {
  "Access-Control-Allow-Origin": SITE_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json; charset=utf-8"
};

const SYSTEM_RULES = `تو «راهنمای تاریخ و فرهنگ شوشترجوان» هستی. فقط بر پایه اسناد پژوهشیِ فرستاده‌شده پاسخ بده.
- فارسی روان و روشن بنویس.
- هرگز جزئیات، تاریخ، نام یا نقل‌قول نساز.
- اگر سند کافی نیست، صریح بگو «در دانشنامه فعلی سند کافی ندارم».
- روایت شفاهی، فرضیه و واقعیت مستند را از هم جدا کن.
- اگر منابع اختلاف دارند، اختلاف را توضیح بده.
- در پایان پاسخ، منابع ارائه‌شده را با عنوان و نشانی‌شان فهرست کن.
- پرسش نامرتبط با شوشتر را محترمانه خارج از حوزه این دستیار اعلام کن.
- پاسخ را با اطلاعات بیرون از متن اسناد تکمیل نکن.`;

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");
    if (origin && origin !== SITE_ORIGIN) return new Response(JSON.stringify({ error: "مبدأ درخواست مجاز نیست." }), { status: 403, headers: cors });
    if (request.method === "OPTIONS") return new Response(null, { headers: { ...cors, "Access-Control-Allow-Origin": origin || SITE_ORIGIN } });
    if (request.method !== "POST") return new Response(JSON.stringify({ error: "فقط درخواست POST پذیرفته می‌شود." }), { status: 405, headers: cors });
    if (!env.GEMINI_API_KEY) return new Response(JSON.stringify({ error: "کلید امن مدل هنوز در تنظیمات سرویس ثبت نشده است." }), { status: 503, headers: cors });
    let body;
    try { body = await request.json(); } catch { return new Response(JSON.stringify({ error: "درخواست نامعتبر است." }), { status: 400, headers: cors }); }
    const question = String(body.question || "").trim();
    const docs = Array.isArray(body.documents) ? body.documents.slice(0, 6) : [];
    if (!question || question.length > 1200) return new Response(JSON.stringify({ error: "پرسش باید بین ۱ تا ۱۲۰۰ نویسه باشد." }), { status: 400, headers: cors });
    if (!docs.length) return new Response(JSON.stringify({ error: "برای این پرسش سند مرتبطی در دانشنامه پیدا نشد." }), { status: 422, headers: cors });
    const context = docs.map((d, i) => `سند ${i+1}: ${String(d.title || "").slice(0,180)}\nمتن: ${String(d.content || "").slice(0,3500)}\nمنابع: ${JSON.stringify(d.sources || [])}`).join("\n\n");
    const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent";
    try {
      const upstream = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_RULES }] },
          contents: [{ role: "user", parts: [{ text: `اسناد دانشنامه:\n${context}\n\nپرسش کاربر:\n${question}` }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 700 }
        })
      });
      const data = await upstream.json();
      if (!upstream.ok) return new Response(JSON.stringify({ error: "سرویس هوش مصنوعی پاسخ موفق نداد. تنظیمات یا سهمیه API را بررسی کنید." }), { status: 502, headers: cors });
      const answer = data.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("").trim();
      if (!answer) return new Response(JSON.stringify({ error: "پاسخ قابل‌استفاده‌ای دریافت نشد." }), { status: 502, headers: cors });
      return new Response(JSON.stringify({ answer, usedDocuments: docs.map(d => d.title) }), { headers: cors });
    } catch {
      return new Response(JSON.stringify({ error: "ارتباط با سرویس هوش مصنوعی برقرار نشد." }), { status: 502, headers: cors });
    }
  }
};