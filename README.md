# THE ROAD — Ahmad Qattan portfolio

A bilingual (Arabic-first, RTL + English) personal portfolio built on one idea:
**the page is a road and the visitor travels down it.** A winding path draws
itself on scroll, a glowing dot rides the path, milestones light up as you pass,
the background travels gold → white, and **Think Equality** is a fork in the
road — a portal that plays a gold-iris transition, then opens the external site.

Brand: Lateef (Arabic) / Fraunces + Inter (English), gold `#B7A441` + white.

---

## Tech stack

- **Next.js 15 (App Router) + TypeScript + Tailwind CSS** — statically exported
  (`output: "export"`) to `./out`, so it deploys anywhere with zero server runtime.
- **GSAP + ScrollTrigger** — the road draw, traveler, marker lighting, gateway
  approach, and the portal sequence. The road draw uses `stroke-dashoffset`
  (no premium DrawSVG plugin required).
- **Lenis** — smooth scroll, synced to GSAP’s ticker, on its own rAF.
- **`@gsap/react` (`useGSAP`)** — scoped GSAP with automatic cleanup.
- **`next/font`** — self-hosted Lateef / Fraunces / Inter with `font-display: swap`.

> Animation deps are limited to **GSAP + Lenis** (per the perf budget). All
> mount/unmount and cinematic transitions are done with GSAP timelines + React
> state + CSS, so there is no third animation library to ship.

Only `transform`, `opacity`, `clip-path` (and the sanctioned SVG
`stroke-dashoffset` for the road draw) are animated.

---

## Run it

```bash
npm install
npm run dev        # http://localhost:3000

npm run build      # static export → ./out
npm run preview    # serve ./out at http://localhost:3000
```

Node ≥ 18.18.

### Deploy

- **Vercel:** import the repo — it builds and serves `./out` automatically.
- **Cloudflare Pages / any static host:** build command `npm run build`,
  output directory `out`.

---

## Project structure

```
app/
  layout.tsx        Root layout: next/font, SEO metadata, hreflang, Person JSON-LD
  page.tsx          Renders <App/>
  globals.css       Design tokens + the overlap-fix timeline + all interaction CSS
  icon.svg          Favicon
components/
  App.tsx           Client root: LocaleProvider + chrome + locale crossfade
  Hero.tsx          Hero / page-load sequence + restrained sky parallax
  RoadJourney.tsx   THE ENGINE — builds the path, draws on scroll, rides the
                    traveler, lights markers, drives the gateway approach, Lenis
  Stop.tsx          Renders a milestone card by type (+ "expand if long")
  GatewayStop.tsx   Think Equality gateway + the portal sequence (iris / curtain)
  Marker.tsx        Number-in-disc marker (and the ✦ gateway marker)
  Traveler.tsx      The glowing dot
  LocaleToggle.tsx  AR/EN corner toggle
  ScrollProgress.tsx Slim progress bar under the top bar
  icons.tsx         Service / arrow / portal glyphs
lib/
  content.ts        ★ SINGLE SOURCE OF TRUTH for all copy (AR + EN)
  config.ts         Portal variant + timing knobs
  locale.tsx        Locale state (URL ?lang=, no localStorage) + dir/lang/fonts
  numerals.ts       Eastern-Arabic numerals + stop numbering
  useReducedMotion.ts
test/
  smoke.mjs         Optional Playwright check (no-overlap, RTL, portal). See below.
```

---

## Where real content goes

**Everything is in [`lib/content.ts`](lib/content.ts)** — one typed config the
client edits in one place. All copy is placeholder and marked `[محتوى مبدئي]`
(AR) / `[Placeholder]` (EN). Replace the strings per locale; structure stays.

| What | Where in `content.ts` |
| --- | --- |
| Hero name / wildcard line / intro | `ar.hero`, `en.hero` |
| Each milestone (About → Contact) | `ar.stops[]`, `en.stops[]` |
| **Think Equality URL** | the `gateway` stop → `url` (currently **`"#"`**) |
| **WhatsApp number / link** | the `contact` stop → `whatsapp.number` / `whatsapp.href` |
| **Location** | the `contact` stop → `location` |
| Stats / quotes / values / ventures | the typed `stats` / `quotes` / `chips` stops |

> Milestone numbers are generated automatically (Eastern-Arabic in AR, Western in
> EN); the gateway is a ✦, never a number. Card sides alternate automatically.

### The Think Equality URL

In `content.ts`, find the `think-equality` stop and set `url` to the real
address. While it stays `"#"`, the portal plays as a **demo** (it animates and
reverses but does not navigate). Once a real URL is set, the sequence plays and
then opens it in a new tab (`rel="noopener noreferrer"`).

---

## Tuning

### Gold intensity (the gold → white journey)

In [`app/globals.css`](app/globals.css), the `:root` block defines the page
gradient stops:

```css
--grad-0: #b7a441;  /* top — the starting gold (raise/lower intensity here) */
--grad-1: #c4b561;
--grad-2: #d6cb8c;
/* … → */
--grad-6: #ffffff;  /* bottom — clarity / white */
```

Make the start more intense by darkening `--grad-0/1/2`; soften it by lightening
them. The road stroke gradient and CTA golds use the brand tokens above them.

### Portal effect — iris vs curtain

In [`lib/config.ts`](lib/config.ts):

```ts
export const PORTAL_VARIANT: "iris" | "curtain" = "iris";
```

- **`iris`** (default): a gold `clip-path: circle()` expands from the button to
  fill the viewport, the wordmark fades in, the link opens, then the iris reverses.
- **`curtain`**: a full-width gold panel sweeps across, reveals a brief splash,
  opens the link, then sweeps away.

Timings are in the same file (`PORTAL`).

> **Note on “animate then open”:** the sequence opens the external site near the
> end of the animation. Browsers allow this within ~1s of a click; the timings
> here stay inside that window. If you ever need a longer pre-navigation
> sequence, open the tab on click and set its location afterward.

---

## Accessibility & reduced motion

- `prefers-reduced-motion` is fully honored: no Lenis, no scrubbed draw — the
  finished road shows with every marker lit, cards are visible, and the portal
  **just opens the link**. All CSS animations/transitions are neutralized.
- WCAG AA: body text is ink (not gold/white). Hero text on the brightest gold is
  ink (~5.9:1). Visible `:focus-visible`, a skip link, full keyboard nav,
  semantic landmarks (`header` / `main` / `footer`, headings, `section`).
- External links use `target="_blank" rel="noopener noreferrer"`.

## SEO

- Set the production origin in [`app/layout.tsx`](app/layout.tsx) (`SITE_URL`) —
  it feeds canonical, `hreflang` (`ar` / `en` / `x-default`), Open Graph and
  Twitter cards.
- Replace [`public/og.svg`](public/og.svg) with a 1200×630 share image (a PNG is
  recommended for the widest crawler support).
- Add the client’s social URLs to the `Person` JSON-LD `sameAs` array.

## Performance

Static export, `next/font` (swap, no layout shift), no raster images, GSAP +
Lenis as the only animation deps, compositor-friendly animations. Run Lighthouse
against the built output (`npm run preview`) — target ≥ 90 perf + a11y.

## Optional smoke test

A headless check of the acceptance criteria (no marker/number overlap at desktop
+ mobile, no horizontal overflow, the road draws, RTL/EN toggle, the portal
plays and reverses):

```bash
npm run build && npm run preview          # terminal 1
npm i -D playwright && npx playwright install chromium
BASE_URL=http://localhost:3000 node test/smoke.mjs   # terminal 2
```
