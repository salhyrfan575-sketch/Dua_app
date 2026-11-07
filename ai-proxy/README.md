# ShoushtarJavan AI proxy

This small Node.js service relays browser requests to Vireonix because the upstream API currently answers HTTP 200 but does not return CORS headers for the GitHub Pages origin.

## Routes

- `GET /health` — health check.
- `OPTIONS /api/ai` — CORS preflight for the approved site origins.
- `POST /api/ai` — validates and forwards an OpenAI-compatible chat request to Vireonix.

## Deploy on Railway

1. Create a new Railway service from this GitHub repository.
2. Set the service **Root Directory** to `/ai-proxy`.
3. Railway detects the Node app and runs `npm start`; no API key is required by the current Vireonix API.
4. Generate a public domain for the service.
5. Test `https://YOUR-RAILWAY-DOMAIN/health` and confirm it returns `{"ok":true,...}`.
6. Test CORS preflight and a real POST from the published website before changing the site's endpoint.

The proxy only accepts requests from the GitHub Pages site and the ShoushtarJavan domain variants listed in `server.mjs`. It limits request size and applies a basic per-IP rate limit. Do not add provider credentials to this repository.
