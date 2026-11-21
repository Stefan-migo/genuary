# Genuary 2025 — repositorio + plataforma de visualización

Consolidar los 26 sketches de Genuary 2025 que están sueltos en disco en un repo git
versionado y agregar una galería estática local que permita verlos, abrirlos y navegar
hacia el código. Enumera cada proyecto con su prompt oficial.

## Specs

S1. El repositorio debe contener **todos** los proyectos de Genuary 2025 presentes en
disco: `day1`–`day27` (no existe `day11`), incluyendo las variantes `day5/v2` y las tres
versiones de `day23` y `day24`.

S2. Debe existir una **web/plataforma para visualizar todos los proyectos**. La galería
vive en el `index.html` de la raíz, lista un card por proyecto con día, prompt oficial y
thumbnail estático, y permite abrir el sketch.

S3. Publicación: **"Solo local por ahora"**. No se configura GitHub Pages ni se hace
deploy. El README documenta cómo levantarlo localmente.

S4. Presentación: **"Grid con thumbnails estáticos"**. Cada card muestra un PNG capturado
del sketch en `gallery/thumbs/`. No se cargan iframes en vivo en el grid.

S5. `day23` versión Google: **"Excluir del sitio, código sin .env"**. El servidor Node
(`day23/version google/server`) queda en el repo sin `.env` versionado. Las variables
requeridas se documentan en `day23/version google/server/README.md` (el guard de seguridad
del harness bloquea crear `.env.example`; no se esquiva). No aparece como proyecto
navegable en la galería.

S6. Repositorio destino: **"Reusar Stefan-migo/genuary"**. Se restaura `.git_disabled`
como `.git` conservando los 3 commits existentes, sobre `origin
https://github.com/Stefan-migo/genuary.git`. Sin force-push. El push es decisión del humano.

S7. El contenido versionado no incluye secretos ni `node_modules`. `.gitignore` cubre
`.env`, `node_modules/` y artefactos de sistema operativo.

S8. Checks verificables: `tools/check-gallery.mjs` valida que toda entrada de
`gallery/projects.json` tenga `index.html` en disco, tenga thumbnail no vacío, responda
HTTP 200 en el server local, y que la página renderizada contenga un card por proyecto.
Falla con exit code distinto de 0 y mensaje en stderr cuando algo no se cumple.

## Tasks

| ID | Specs | Ruta | Commit |
| --- | --- | --- | --- |
| T1 | S6, S7 | Restaurar git (`.git_disabled` → `.git`), `.gitignore`, `server/README.md` con las env vars, quitar `.env` del tracking | `chore(repo): restore history and ignore secrets` |
| T2 | S1 | Versionar los sketches restantes (day4–day27, variantes, assets) | `feat(collection): add remaining genuary 2025 sketches` |
| T3 | S2, S4, S8 | Galería estática: `index.html`, `gallery/`, `tools/capture-thumbnails.mjs`, `tools/check-gallery.mjs`, thumbnails | `feat(gallery): static grid with per-project thumbnails` |
| T4 | S3, S5 | `README.md`: estructura, cómo correr local, regenerar thumbnails, nota day23 Google | `docs: document collection and local gallery` |

Ruta de trabajo: inline (parent). Las unidades comparten el contrato de
`gallery/projects.json`, así que partirlas en writers agrega coordinación sin paralelismo real.

Commits en `feat/genuary-gallery`: T1 `8cf2b39` · T2 `98e2131` · T3 `900b4ff` · T4 (este
commit).

## Log

L1 (pedido original, verbatim):

> hey chat seria posible crear un repositorio con todos estos proyectos del genuary 2025? la idea es crear una web/plataforma para visualizar todos los poryectos creados online

L2 (decisiones del humano, verbatim en sus etiquetas):

- Hosting: "Solo local por ahora"
- Galería: "Grid con thumbnails estáticos"
- Day23 Google: "Excluir del sitio, código sin .env"
- Repo destino: "Reusar Stefan-migo/genuary"

L3 (evidencia de exploración):

- `git remote -v` vacío en el working tree; `.git_disabled/config` define `origin`
  `https://github.com/Stefan-migo/genuary.git`, rama `main`, 3 commits (`fd94196`,
  `1221193`, `c039369`).
- `gh api repos/Stefan-migo/genuary/git/trees/main?recursive=1` devuelve solo `day1`,
  `day2`, `day3`. El resto nunca se publicó.
- `has_pages: false` — no hay sitio activo.
- `day23/version google/server/.env` contiene una `GOOGLE_API_KEY` real; 4.6 MB de
  `node_modules` en la misma carpeta. Ese árbol nunca se pusheó, así que no hay filtración.
- `day7/sketch.js` es un stub (solo `background(220)`).
- Chrome headless disponible (`/usr/bin/google-chrome`) y captura correctamente
  (`--virtual-time-budget`), verificado con `day3`.
- `.agents/skills/cortex-persona/SKILL.md` referenciado por `AGENTS.md` no existe en disco.

L4 (límite de slice): el commit `98e2131` mueve 15037 líneas, muy por encima del slice de
~400. Es contenido importado que ya existía en disco (26 sketches con sus assets), no
superficie escrita en esta sesión: no hay revisión incremental posible sobre arte. El slice
de código realmente escrito por esta feature es T1 + T3 + T4 (≈500 líneas: `index.html`,
`gallery/app.js`, `gallery/style.css`, `gallery/projects.json`, `tools/*`, `README.md`).

L5 (decisiones de captura, tomadas por evidencia de ejecución):

- `--virtual-time-budget` no sirve para los sketches con audio: `day2` y `day18` quedaban en
  "Loading…" (5502 bytes idénticos) porque el reloj virtual no deja decodificar media. Se
  reemplazó por un cliente CDP mínimo sobre el `WebSocket` nativo de Node 22
  (`tools/lib/cdp.mjs`) con espera en tiempo real y dispositivo de audio falso.
- El thumbnail se recorta al rectángulo del `<canvas>` (con `scrollIntoView` previo) para no
  arrastrar márgenes blancos ni el panel de dat.GUI de `day1`.
- Formato JPEG q86 en vez de PNG: `day2` pesaba 907 KB como PNG recortado y 214 KB como
  JPEG, sin diferencia visible a tamaño de card.
- `object-fit: contain` en las cards: las relaciones de aspecto son dispares (1:1, 4:3,
  16:10) y `cover` recortaba arte.

L6 (cambio de requerimiento): el humano pregunta cuál era el proyecto que necesitaba una API
y ofrece una key de DeepSeek. Se cambia el proveedor del backend de `day23/version google`:
Gemini (`@google/generative-ai`) → DeepSeek vía `fetch` (API compatible OpenAI), sin SDK y sin
dependencia nueva. El contrato `POST /api/generate-phrase → { phrase }` y el puerto 3000 se
mantienen porque `day23/version google/sketch.js` los tiene hardcodeados. Se agrega CORS
porque el sketch se sirve desde otro puerto (la galería) y el POST JSON dispara preflight.
S5 queda: el servidor usa `DEEPSEEK_API_KEY` desde un `.env` no versionado; la key nunca vive
en el browser.

Verificado con `curl` y con render headless: preflight `204` con headers CORS, `POST` sin key
responde `503` JSON, y el sketch cae a su quote interno marcado `(AI unavailable)`.

L7 (decisión del humano): "Sí, listarlo con nota de backend". `day23/version google` vuelve a
la galería: nueva entrada `day23-google` en `gallery/projects.json` con thumbnail propio y nota
que explica la dependencia del proxy. S5 deja de excluirlo del sitio; el backend sigue sin
versionar su `.env`.

L8 (deploy): el humano elige "Todo junto: galería + API en un proyecto" en Vercel. Se reemplaza
el backend express por una función serverless con la misma lógica:

- `lib/deepseek.js` (CommonJS) es el único lugar que llama al proveedor; lo usan la función y el
  server local.
- `api/generate-phrase.js` es un Web Handler (`Request` → `Response`): OPTIONS 204, 405 para
  otros métodos, 200 `{phrase}`, y el status del `PhraseError` (503 sin key, 502 proveedor).
  No reenvía el body del proveedor al browser (puede mencionar la key o la cuota); lo loguea.
- `tools/lib/static-server.mjs` acepta `{ routes, port }` y despacha un `Request` web al
  handler, así lo local y lo deployado corren el mismo código. Cualquier método sobre una ruta
  registrada llega al handler (paridad con Vercel), no solo el método exacto.
- `tools/serve.mjs` es el único comando de desarrollo: galería + `/api` en un origen, cero
  dependencias, y lee `.env` de la raíz.
- `day23/version google/sketch.js` pasa a URL relativa `/api/generate-phrase`, así funciona
  igual detrás de Vercel o del server local.
- `day23/version google/server/` queda como runner local legacy (express + `public/`), ya no
  es el camino de deploy.

Verificado: GET 405 / POST 503 sin key / OPTIONS 204 en local; con stub de proveedor, POST 200
`{"phrase":"Concrete remembers every hand that poured it."}` y render headless del sketch con
la frase dibujada; proveedor 500 → proxy 502 sin filtrar el body; `check-gallery` 346/346 y
`capture-thumbnails day3` sigue funcionando.
