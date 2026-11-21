# Day 23 — "Inspired by brutalism" (API version)

This sketch asks a language model for a short brutalist phrase on every click, so it needs a
small backend. It does **not** run as a static page; it is therefore not listed in the root
gallery.

The original version called Google Gemini. It now calls **DeepSeek**, which is
OpenAI-compatible, so the whole backend is one `fetch` with no provider SDK.

## Requirements

- Node.js 18+ (uses the built-in `fetch`)
- A DeepSeek API key: https://platform.deepseek.com/api_keys

## Environment variables

Create a `.env` file in this directory (never committed) with:

| Variable | Description |
| --- | --- |
| `DEEPSEEK_API_KEY` | Required. Your DeepSeek key. |
| `DEEPSEEK_MODEL` | Optional, defaults to `deepseek-chat`. |
| `PORT` | Optional, defaults to `3000`. The sketch expects `3000`. |

```bash
cd "day23/version google/server"
printf 'DEEPSEEK_API_KEY=%s\n' 'sk-your-key-here' > .env
```

## Run

```bash
cd "day23/version google/server"
npm install
npm start
```

Then either open http://localhost:3000 (this server serves the copy under `public/`) or open
the gallery and run the day 23 entry: the sketch posts to `http://localhost:3000/api/generate-phrase`
with an absolute URL, and this server replies with CORS headers so the cross-origin POST works.

## Endpoint

`POST /api/generate-phrase` → `{ "phrase": "…" }`

Failure modes:

- `503` when `DEEPSEEK_API_KEY` is missing.
- `502` when DeepSeek answers with an error (bad key, quota, outage).
- `500` on network failure or an empty completion.

The sketch never breaks on those: it falls back to a built-in quote and marks it
`(AI unavailable)`.

## Status

This Express server is a legacy local runner; the deployment target is the root
`api/generate-phrase.js` function, with `tools/serve.mjs` for local work. Both share the core
implementation in `lib/deepseek.js`.

Kept in the repository for reference.
