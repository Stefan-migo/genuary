# Genuary 2025

Every generative sketch made for the [Genuary 2025](https://genuary.art/2025/prompts) daily
prompt challenge, plus a static gallery that lists, previews and runs them.

Twenty-six sketches across twenty-six prompt days, written mostly in p5.js. Each one is a
self-contained folder: open its `index.html` and it runs, no build step, no server logic.

## Layout

```
index.html                 gallery: grid of cards, each opening its sketch in a viewer
gallery/
  projects.json            the collection: day, prompt, credit, paths, tags, notes
  app.js                   renders the grid and the iframe viewer
  style.css                dark editorial layout
  thumbs/<slug>.png        one generated preview per entry
api/
  generate-phrase.js      serverless Web Handler for the day 23 phrase endpoint
lib/
  deepseek.js              shared DeepSeek API client
tools/
  serve.mjs                local gallery and API server on one origin
  capture-thumbnails.mjs   renders every sketch in headless Chrome into gallery/thumbs/
  check-gallery.mjs        verifies data, files, thumbnails, HTTP and rendered DOM
  lib/static-server.mjs    tiny dependency-free static server used by local tools
day1/ … day27/             one folder per prompt (day11 was never made)
  index.html               entry point, loads p5.js from a CDN
  sketch.js                the sketch itself
  …                        audio, images, shaders and notes live next to their sketch
day5/v2/                   alternate take on day 5
day23/version {deepseek,gpt,google}/   three takes on brutalism
day24/{DS,google,GPT}/     three takes on geometric art
odd/tasks/genuary-2025-gallery.md      plan and decision log for this repository
```

`gallery/projects.json` is the single source of truth for what the gallery shows. Prompts and
credits are quoted from the official list.

## Run it locally

The gallery fetches `gallery/projects.json`, so it needs HTTP — opening `index.html` from the
filesystem will fail on CORS. The dependency-free local server serves the gallery and day 23
API on one origin:

```bash
node tools/serve.mjs
```

Open the gallery URL it prints (by default http://localhost:3000). Sketches are loaded in an
iframe on demand; the pieces that need the microphone or play audio ask the browser for
permission when they start. As a static-only fallback, run `python3 -m http.server 8000`;
day 23 then uses its built-in quote because the API route is unavailable.

### Day 23 environment

The local server reads a root `.env` file (git-ignored). Set `DEEPSEEK_API_KEY` there to enable
generated phrases. `DEEPSEEK_MODEL` and `DEEPSEEK_BASE_URL` are optional; `PORT` changes the
local server port (default `3000`). Existing environment variables take precedence over `.env`.

### Deploy on Vercel

Import this repository with Root Directory set to the repository root, no build step, and no
framework preset. Vercel deploys `api/generate-phrase.js` as a serverless function. Set
`DEEPSEEK_API_KEY` (and optionally `DEEPSEEK_MODEL`) in Project Settings → Environment
Variables; changing an environment variable requires a redeploy. The browser only ever talks
to `/api/generate-phrase`, so the key never ships to the browser. A public endpoint using a
free-tier provider key can be abused, so monitor usage and protect the key. If the function
fails, the sketch falls back to its built-in quote.

## Regenerate thumbnails

Card previews are static PNGs, so they never cost CPU until you open a sketch.

```bash
node tools/capture-thumbnails.mjs              # all entries
node tools/capture-thumbnails.mjs day8 day12   # only these slugs
```

The script starts its own static server, renders each page in headless Chrome and writes
`gallery/thumbs/<slug>.png`. It needs Chrome or Chromium on `PATH`; set `CHROME=/path/to/chrome`
to point elsewhere, and `RENDER_MS` to change how long a sketch is given to draw
(default `5000`).

## Verify

```bash
node tools/check-gallery.mjs
node tools/check-mobile.mjs          # every entry in a 390x844 phone viewport
node tools/check-api.mjs             # the day 23 function contract
```

It fails (exit code 1) when a `projects.json` entry is missing its page, its source or a
non-blank thumbnail; when an entry does not answer HTTP 200; when the rendered gallery does
not show one card per project; or when a `.env` file or `node_modules` slipped into version
control.

## Mobile

Every sketch links `shared/mobile.css`, which does three things and nothing else: removes the
page margin, lets the canvas shrink to fit without distorting its aspect ratio, and centres a
piece whose only content is the canvas. Sketches keep their own coordinate systems, so a piece
designed as a 600x600 square stays square and is letterboxed on a tall phone.

`node tools/check-mobile.mjs` is the definition of correct here: viewport meta present and
effective, no horizontal overflow, canvas inside the viewport. It does not judge whether a piece
looks good, only that it fits. `PHONE=430x932` checks a different device.

## Adding a sketch

1. Create `dayNN/` with `index.html` and `sketch.js` (copy the shape of a neighbouring day).
   The page needs `<meta name="viewport" content="width=device-width, initial-scale=1">` and a
   link to `../shared/mobile.css`, or it will not fit a phone.
2. Add an entry to `gallery/projects.json` with a unique `slug`, the `day`, the official
   `prompt`, the `credit`, `path`, `source`, and optional `tags`/`note`/`variant`.
   If the piece needs interaction to look like anything, or its controls sit over the
   canvas, add an optional `capture` expression: it runs in the page before the thumbnail
   is taken (a sketch can use it to hide UI or trigger its own frame).
3. Run `node tools/capture-thumbnails.mjs dayNN` and then `node tools/check-gallery.mjs`.

## Notes on the collection

- Day 11 ("Impossible day") was never attempted, and days 28-31 are absent.
- `day7` is a stub: it only clears the canvas. It is kept as an honest record.
- `day1` reads the microphone, `day2` and `day18` play bundled audio, `day8` writes 100.000
  points into the pixel buffer and `day20` is WEBGL. Expect them to be the heaviest.
- `day23/version google` uses the root API function in deployment and the same handler via
  `node tools/serve.mjs` locally. `day23/version google/server/` is a legacy local runner kept
  for reference; the deployment path is the root `api/` function. The sketch falls back to a
  built-in quote when the function is unavailable.

## Requirements

- A browser. p5.js and the other libraries load from CDNs, so the sketches need a connection.
- Node.js 18+ to run `node tools/serve.mjs`; Python 3 is an optional static-only fallback.
- Node.js 18+ and Chrome, only for the thumbnail and verification scripts.
