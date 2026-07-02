// =============================================================================
// scripts/assets.mjs — derivative pipeline: source PNGs → AVIF/WebP/JPEG at
// 720/1280/1920 (portraits at 540/900), into public/assets/<key>/.
// Sprites and alpha layers stay PNG (alpha) but get resized WebP too.
//   node scripts/assets.mjs
// =============================================================================
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = "public/assets/source";
const OUT = "public/assets";
const WIDTHS = [720, 1280, 1920];
const PORTRAIT_WIDTHS = [540, 900];

const SCENES = [
  "scene-01-world",
  "scene-02-bg",
  "scene-03-station",
  "scene-04-pen",
  "scene-05-training",
  "scene-06-fork-arch",
  "scene-07-dawn",
  "scene-08-traveler",
  "scene-09-amman",
];
const PORTRAITS = ["scene-01-world-portrait", "scene-09-amman-portrait"];
const ALPHA = ["scene-02-fg", "sprite-palms", "sprite-kite", "sprite-papers"];

async function emit(name, widths, formats) {
  const src = path.join(SRC, `${name}.png`);
  const dir = path.join(OUT, name);
  await mkdir(dir, { recursive: true });
  const meta = await sharp(src).metadata();
  for (const w of widths) {
    if (w > meta.width) continue;
    for (const [ext, opts] of Object.entries(formats)) {
      const out = path.join(dir, `${name}-${w}.${ext}`);
      await sharp(src).resize({ width: w })[opts.fn](opts.o).toFile(out);
      process.stdout.write(".");
    }
  }
  console.log(` ${name}`);
}

const OPAQUE = {
  avif: { fn: "avif", o: { quality: 55 } },
  webp: { fn: "webp", o: { quality: 74 } },
  jpg: { fn: "jpeg", o: { quality: 78, mozjpeg: true } },
};
const ALPHA_FMT = {
  webp: { fn: "webp", o: { quality: 80, alphaQuality: 90 } },
  png: { fn: "png", o: { compressionLevel: 9 } },
};

for (const s of SCENES) await emit(s, WIDTHS, OPAQUE);
for (const p of PORTRAITS) await emit(p, PORTRAIT_WIDTHS, OPAQUE);
for (const a of ALPHA) await emit(a, [720, 1280], ALPHA_FMT);

// og-cover passthrough is generated separately (already 1200×630 PNG).
const files = await readdir(OUT, { recursive: true });
console.log(`done — ${files.filter((f) => /\.(avif|webp|jpe?g|png)$/.test(f)).length} derivative files`);
