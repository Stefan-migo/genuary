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
tools/
  capture-thumbnails.mjs   renders every sketch in headless Chrome into gallery/thumbs/
  check-gallery.mjs        verifies data, files, thumbnails, HTTP and rendered DOM
  lib/static-server.mjs    tiny dependency-free static server used by both scripts
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
filesystem will fail on CORS. Any static server works:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. Sketches are loaded in an iframe on demand; the pieces that
need the microphone or play audio ask the browser for permission when they start.

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
```

It fails (exit code 1) when a `projects.json` entry is missing its page, its source or a
non-blank thumbnail; when an entry does not answer HTTP 200; when the rendered gallery does
not show one card per project; or when a `.env` file or `node_modules` slipped into version
control.

## Adding a sketch

1. Create `dayNN/` with `index.html` and `sketch.js` (copy the shape of a neighbouring day).
2. Add an entry to `gallery/projects.json` with a unique `slug`, the `day`, the official
   `prompt`, the `credit`, `path`, `source`, and optional `tags`/`note`/`variant`.
3. Run `node tools/capture-thumbnails.mjs dayNN` and then `node tools/check-gallery.mjs`.

## Notes on the collection

- Day 11 ("Impossible day") was never attempted, and days 28-31 are absent.
- `day7` is a stub: it only clears the canvas. It is kept as an honest record.
- `day1` reads the microphone, `day2` and `day18` play bundled audio, `day8` writes 100.000
  points into the pixel buffer and `day20` is WEBGL. Expect them to be the heaviest.
- `day23/version google` is the only piece with a backend: it asks Gemini for a phrase on each
  request. It is excluded from the gallery and documented in
  `day23/version google/server/README.md` — create your own `.env` there, it is git-ignored.

## Requirements

- A browser. p5.js and the other libraries load from CDNs, so the sketches need a connection.
- Python 3 or any static file server, to view the gallery.
- Node.js 18+ and Chrome, only for the thumbnail and verification scripts.
