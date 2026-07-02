# أحمد قطّان — The Night Road / طريق الليل

A cinematic one-page scroll experience: one glowing golden road through a
Jordanian desert night tells Ahmad Qattan's story. Arabic-first, RTL, with a
full English mirror. Built on Next.js 15 (static export), GSAP + Lenis.

## How the world is built

- **The page IS the night.** `--night #0B0906` is both the page background and
  the frames' corner color. Every AI-painted frame is a full-bleed layer whose
  edges dissolve into the page via CSS masks (`.fuse`, `.fuse-wide`,
  `.fuse-box` in `app/globals.css`). No `<img>` rectangle ever survives.
- **One line, one light.** `components/engine/RoadLine.tsx` draws a single
  SVG path across the whole journey: per-scene road segments fitted over the
  painted asphalt (stored as `path` / `pathPortrait` in `lib/content.ts`,
  image coordinates), affine-mapped through each scene's cover transform and
  joined by generated void curves. A hot head + trail ride it, scrubbed by
  scroll; `mix-blend-mode: screen` + soft strokes make ±10px of misfit read
  as light on the painted road.
- **The odometer** (`components/ScrollProgress.tsx`) interpolates km
  piecewise between scene centres, so it reads each stop's labelled km (كم ٧،
  كم ٣٥ … كم ٤٧) exactly when the light reaches it.
- **Dawn inversion.** From the arch's centring through the dawn scene,
  `html.is-dawn` swaps the page vars to `--dawn`/`--ink` over 1s and back
  (`components/GatewayStop.tsx`).
- **The unifiers.** One animated film-grain layer (SVG feTurbulence, stepped
  jumps, opacity .055) and one vignette sit above everything.
- **Live bits** (`components/engine/LiveBits.tsx`): window/lamp flickers,
  teapot steam, breathing spotlight, drifting papers, sun pulse, canvas city
  shimmer — anchored in image coordinates via the same cover transform.
- **Sky** (`components/engine/SkyCanvas.tsx`): seeded stars + gold dust,
  45fps cap, pauses when hidden, eases out during dawn.

## Editing content

Everything lives in `lib/content.ts` (AR + EN). Placeholders are marked
[محتوى مبدئي] / [Placeholder]. The Think Equality gateway URL stays `"#"`
and the WhatsApp number stays `9627XXXXXXXX` until the real ones arrive.
Set `SITE_URL` in `app/layout.tsx` before deploying.

## Refitting the line (?fit=1)

Open any page with `?fit=1`: pick a scene, click points along the painted
road (Z undo, C clear, B branch mode), copy the printed `d` into that
scene's `path` in `lib/content.ts`. The overlay uses the exact cover mapping
the site uses, in landscape image coordinates (1672×941).

## Assets

- Sources: `public/assets/source/` (canonical scene names; `rejected/` holds
  alternates; the sprites' alpha was recovered from painted checkerboards).
- Derivatives: `node scripts/assets.mjs` (sharp) → AVIF/WebP/JPEG at 720/1280
  (+540/900 portraits) into `public/assets/<name>/`.
- `public/ahmad-qattan.jpg` is the real photo — never modified; its archive
  look (`components/Portrait.tsx`) is CSS-only.

## Commands

```bash
npm run dev        # develop
npm run build      # static export → ./out (Cloudflare-ready)
npm run preview    # serve ./out on :3000
node scripts/assets.mjs                 # regenerate image derivatives
BASE_URL=http://localhost:3000 node test/smoke.mjs   # headless smoke suite
```

Reduced motion: static frames, fully drawn line, no smooth-scroll hijack.
No JS: frames + text stack render and read fine.
