const MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
const KNOWLEDGE_URL = "https://salhyrfan575-sketch.github.io/Dua_app/data/shushtar-knowledge.json";
const ALLOWED_ORIGINS = new Set([
  "https://salhyrfan575-sketch.github.io",
  "http://localhost:8788",
  "http://127.0.0.1:8788"
]);

function cors(origin) {
  const allowed = !origin || ALLOWED_ORIGINS.has(origin);
  return {
    "Access-Control-Allow-Origin": allowed ? (origin || "*") : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}
function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...cors(origin) }
  });
}
function norm(value) {
  return String(value || "").toLowerCase()
    .replace(/[\u0640\u064B-\u065F\u0670]/g, "")
    .replace(/[يى]/g, "ی").replace(/ك/g, "ک")
    .replace(/[ۀة]/g, "ه").replace(/[‌ـ]/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}
function tokens(value) {
  return norm(value).split(" ").filter(x => x.length > 1);
}
async function findLocalSources(question) {
  try {
    const response = await fetch(KNOWLEDGE_URL, { cf: { cacheTtl: 300, cacheEverything: true } });
    if (!response.ok) return [];
    const data = await response.json();
    const query = [...new Set(tokens(question))];
    if (!query.length) return [];
    return (data.documents || []).map(doc => {
      const title = new Set(tokens(doc.title));
      const category = new Set(tokens(doc.category));
      const keywords = new Set(tokens((doc.keywords || []).join(" ")));
      const body = new Set(tokens(doc.content));
      let score = 0, matched = 0;
      for (const term of query) {
        let hit = false;
        if (title.has(term)) { score += 12; hit = true; }
        if (keywords.has(term)) { score += 8; hit = true; }
        if (category.has(term)) { score += 4; hit = true; }
        if (body.has(term)) { score += 1; hit = true; }
        if (hit) matched++;
      }
      const coverage = matched / query.length;
      if (norm(doc.title).includes(norm(question))) score += 24;
      return { doc, score, coverage };
    }).filter(x => x.score >= 8 && x.coverage >= 0.25)
      .sort((a, b) => b.coverage - a.coverage || b.score - a.score)
      .slice(0, 4).map(x => x.doc);
  } catch (_) {
    return [];
  }
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") {
      if (origin && !ALLOWED_ORIGINS.has(origin)) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers: cors(origin) });
    }
    if (origin && !ALLOWED_ORIGINS.has(origin)) return json({ error: "origin_not_allowed" }, 403, origin);
    if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405, origin);
    if (!env.AI) return json({ error: "workers_ai_binding_missing", message: "اتصال مدل هوش مصنوعی هنوز در تنظیمات سرور فعال نشده است." }, 503, origin);

    let body;
    try { body = await request.json(); }
    catch (_) { return json({ error: "invalid_json" }, 400, origin); }

    const messages = Array.isArray(body.messages) ? body.messages.slice(-10) : [];
    if (!messages.length) return json({ error: "messages_required" }, 400, origin);
    const safeMessages = [];
    for (const item of messages) {
      if (!item || !["user", "assistant"].includes(item.role) || typeof item.content !== "string") continue;
      const content = item.content.trim().slice(0, 3000);
      if (content) safeMessages.push({ role: item.role, content });
    }
    if (!safeMessages.length || safeMessages[safeMessages.length - 1].role !== "user") {
      return json({ error: "last_message_must_be_user" }, 400, origin);
    }
    const question = safeMessages[safeMessages.length - 1].content;
    const docs = await findLocalSources(question);
    const localContext = docs.length ? docs.map((d, i) =>
      "[" + (i + 1) + "] " + d.title + "\n" + String(d.content || "").slice(0, 2200) +
      "\nمنابع: " + (d.sources || []).map(s => s.label + " — " + s.url).join("؛")
    ).join("\n\n") : "برای این پرسش مدخل مرتبطی در دانشنامه اختصاصی شوشتر پیدا نشد.";

    const system = [
      "تو دستیار هوشمند شوشترجوان هستی. با فارسی روان، طبیعی، دقیق و متناسب با لحن کاربر پاسخ بده.",
      "به پرسش‌های عمومی در موضوعات گوناگون پاسخ بده؛ فقط به دانشنامه شوشتر محدود نیستی.",
      "اگر سؤال درباره شوشتر است، متن دانشنامه زیر را بر دانسته‌های عمومی مقدم بدان. از آن واقعیت نساز و اگر سند کافی نیست صریح بگو.",
      "اگر منابع با هم اختلاف دارند یا موضوع محل اختلاف است، اختلاف را روشن کن و یک روایت را حقیقت قطعی جا نزن.",
      "اگر پاسخ را نمی‌دانی یا اطلاعات کافی نداری، صادقانه بگو؛ عدد، تاریخ، نقل‌قول یا منبع جعلی نساز.",
      "برای رویدادهای بسیار جدید ادعای دسترسی زنده به اینترنت نکن. اگر داده به‌روز در متن سؤال نیست، محدودیت را توضیح بده.",
      "پاسخ را مستقیم و معمولاً در چند پاراگراف کوتاه بده. فقط وقتی لازم است فهرست بساز.",
      "اگر از منابع دانشنامه استفاده کردی، در پایان عنوان منبع را ذکر کن. پیوندهای منابع در خروجی جداگانه ارائه می‌شوند.",
      "دانشنامه اختصاصی شوشترجوان:\n" + localContext
    ].join("\n\n");

    try {
      const result = await env.AI.run(MODEL, {
        messages: [{ role: "system", content: system }, ...safeMessages],
        max_tokens: 850,
        temperature: 0.35
      });
      const answer = typeof result === "string" ? result :
        (result && (result.response || result.result || result.output_text)) || "";
      if (!String(answer).trim()) return json({ error: "empty_model_response" }, 502, origin);
      const sources = [...new Map(docs.flatMap(d => d.sources || [])
        .filter(s => s && s.url).map(s => [s.url, s])).values()]
        .slice(0, 8).map(s => ({ label: s.label || s.title || "منبع", url: s.url }));
      return json({ answer: String(answer).trim(), sources, model: MODEL }, 200, origin);
    } catch (error) {
      return json({ error: "model_request_failed", message: "مدل هوش مصنوعی موقتاً پاسخ‌گو نیست. کمی بعد دوباره تلاش کن." }, 502, origin);
    }
  }
};
