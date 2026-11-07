import http from "node:http";

const PORT = Number(process.env.PORT || 3000);
const UPSTREAM = process.env.UPSTREAM_API_URL || "https://vireonix.ai/v1/chat/completions";
const ALLOWED_ORIGINS = new Set([
  "https://salhyrfan575-sketch.github.io",
  "https://shoushtarjavan.ir",
  "https://www.shoushtarjavan.ir"
]);
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;
const MAX_BODY = 40 * 1024;
const ipBuckets = new Map();

function send(res, status, body, origin) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...(origin ? {
      "Access-Control-Allow-Origin": origin,
      "Vary": "Origin"
    } : {})
  });
  res.end(JSON.stringify(body));
}

function getClientIp(req) {
  // Railway provides this header; use the first forwarded address.
  return (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown")
    .toString().split(",")[0].trim();
}

function rateLimited(ip) {
  const now = Date.now();
  let bucket = ipBuckets.get(ip);
  if (!bucket || now - bucket.startedAt >= WINDOW_MS) {
    bucket = { startedAt: now, count: 0 };
    ipBuckets.set(ip, bucket);
  }
  bucket.count += 1;
  return bucket.count > MAX_REQUESTS;
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || "";
  const allowedOrigin = ALLOWED_ORIGINS.has(origin) ? origin : null;

  if (req.url === "/health" && req.method === "GET") {
    return send(res, 200, { ok: true, service: "shoushtarjavan-ai-proxy" });
  }

  if (req.url !== "/api/ai" && req.url !== "/api/ai/") {
    return send(res, 404, { error: "Not found" }, allowedOrigin);
  }

  if (req.method === "OPTIONS") {
    if (!allowedOrigin) return send(res, 403, { error: "Origin not allowed" });
    res.writeHead(204, {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin"
    });
    return res.end();
  }

  if (!allowedOrigin) return send(res, 403, { error: "Origin not allowed" });
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return send(res, 405, { error: "Method not allowed" }, allowedOrigin);
  }

  const ip = getClientIp(req);
  if (rateLimited(ip)) {
    return send(res, 429, { error: "Too many requests. Try again in a minute." }, allowedOrigin);
  }

  try {
    let raw = "";
    for await (const chunk of req) {
      raw += chunk;
      if (Buffer.byteLength(raw, "utf8") > MAX_BODY) {
        return send(res, 413, { error: "Request too large" }, allowedOrigin);
      }
    }

    const input = JSON.parse(raw || "{}");
    if (!Array.isArray(input.messages) || input.messages.length === 0) {
      return send(res, 400, { error: "A non-empty messages array is required." }, allowedOrigin);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);
    let upstream;
    try {
      upstream = await fetch(UPSTREAM, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "auto",
          messages: input.messages,
          temperature: Number.isFinite(input.temperature) ? input.temperature : 0.35,
          max_tokens: Math.min(Math.max(Number(input.max_tokens) || 900, 1), 1200),
          stream: false
        }),
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeout);
    }

    const responseText = await upstream.text();
    let data;
    try { data = JSON.parse(responseText); }
    catch { data = { error: "Upstream returned an invalid response.", details: responseText.slice(0, 300) }; }

    return send(res, upstream.status, data, allowedOrigin);
  } catch (error) {
    const isTimeout = error?.name === "AbortError";
    return send(res, isTimeout ? 504 : 502, {
      error: isTimeout ? "AI provider timed out." : "Could not reach the AI provider."
    }, allowedOrigin);
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`ShoushtarJavan AI proxy listening on port ${PORT}`);
});
