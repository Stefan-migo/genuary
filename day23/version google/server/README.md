# Day 23 — "Inspired by brutalism" (Google version)

This sketch asks a Gemini model for a short brutalist phrase on every request, so it
needs a small backend. It does **not** run as a static page and it is therefore not
listed in the root gallery.

## Requirements

- Node.js 18+
- A Google AI Studio API key

## Environment variables

Create a `.env` file in this directory (never committed) with:

| Variable | Description |
| --- | --- |
| `GOOGLE_API_KEY` | Key from https://aistudio.google.com/app/apikey |
| `PORT` | Port for the express server, defaults to `3000` |

## Run

```bash
cd "day23/version google/server"
npm install
npm start
```

Then open http://localhost:3000 — the express server serves `public/` and exposes
`POST /api/generate-phrase`.

## Status

Kept in the repository for completeness. Excluded from the gallery by decision
(see `odd/tasks/genuary-2025-gallery.md`, S5).
