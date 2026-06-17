// Optional headless smoke test for the acceptance criteria (§4 no-overlap,
// no h-overflow, road draws, locale/RTL toggle, portal plays).
//
//   1) npm run build && npm run preview     # serves ./out on :3000
//   2) npm i -D playwright && npx playwright install chromium
//   3) BASE_URL=http://localhost:3000 node test/smoke.mjs
//
// Env overrides: BASE_URL, PW_EXECUTABLE (custom Chromium path).

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const OUT = process.env.SHOTS || "/tmp/shots";

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.log("playwright not installed — skipping smoke test.");
  console.log("  npm i -D playwright && npx playwright install chromium");
  process.exit(0);
}

import { mkdirSync } from "fs";
mkdirSync(OUT, { recursive: true });

const intersects = (a, b) => {
  const p = 0.5;
  return !(a.x + a.w - p <= b.x || b.x + b.w - p <= a.x || a.y + a.h - p <= b.y || b.y + b.h - p <= a.y);
};
const rects = (page, sel) =>
  page.$$eval(sel, (els) =>
    els.map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height };
    }),
  );

async function overlapReport(page, label) {
  const markers = await rects(page, ".marker");
  const cards = await rects(page, ".stop__card, .gateway");
  let mc = 0;
  for (const m of markers) for (const c of cards) if (intersects(m, c)) mc++;
  let mm = 0;
  for (let i = 0; i < markers.length; i++)
    for (let j = i + 1; j < markers.length; j++) if (intersects(markers[i], markers[j])) mm++;
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  console.log(
    `[${label}] markers=${markers.length} cards=${cards.length} | marker×card=${mc} | marker×marker=${mm} | h-overflow=${overflow}px`,
  );
  return { mc, mm, overflow, markers: markers.length };
}

async function scrollThrough(page) {
  await page.evaluate(async () => {
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y <= h; y += Math.round(window.innerHeight * 0.6)) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 200));
  });
}

const errors = [];
const launchOpts = process.env.PW_EXECUTABLE ? { executablePath: process.env.PW_EXECUTABLE } : {};
const browser = await chromium.launch(launchOpts);
let fail = false;

async function newPage(opts) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  page.on("console", (m) => m.type() === "error" && errors.push(`[${opts.label}] ${m.text()}`));
  page.on("pageerror", (e) => errors.push(`[${opts.label}] ${e.message}`));
  return { ctx, page };
}

// 1) Desktop layout/overlap (reduced motion = stable final layout)
{
  const { ctx, page } = await newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce", label: "desktop" });
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await scrollThrough(page);
  const r = await overlapReport(page, "desktop");
  if (r.mc || r.mm || r.overflow > 1 || r.markers < 8) fail = true;
  await page.screenshot({ path: `${OUT}/desktop-mid.png` });
  await ctx.close();
}

// 2) Mobile single-rail layout/overlap
{
  const { ctx, page } = await newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce", label: "mobile" });
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await scrollThrough(page);
  const r = await overlapReport(page, "mobile");
  if (r.mc || r.mm || r.overflow > 1) fail = true;
  await ctx.close();
}

// 3) Motion: road draws, traveler, locale toggle, portal plays + reverses
{
  const { ctx, page } = await newPage({ viewport: { width: 1280, height: 900 }, label: "motion" });
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  const d = await page.$eval(".road__path", (p) => p.getAttribute("d") || "");
  const traveler = (await page.$(".traveler")) != null;
  console.log(`[motion] path=${d.length} chars | traveler=${traveler}`);
  if (d.length < 20 || !traveler) fail = true;

  await page.click(".locale-toggle");
  await page.waitForTimeout(600);
  const dir = await page.evaluate(() => document.documentElement.dir);
  const lang = await page.evaluate(() => document.documentElement.lang);
  if (dir !== "ltr" || lang !== "en" || !page.url().includes("lang=en")) fail = true;
  console.log(`[motion] toggle → dir=${dir} lang=${lang}`);
  await page.click(".locale-toggle");
  await page.waitForTimeout(500);

  await page.evaluate(() => document.querySelector("[data-gateway-stop]")?.scrollIntoView({ block: "center" }));
  await page.waitForTimeout(800);
  await (await page.$(".gateway__btn")).click();
  await page.waitForTimeout(450);
  const visible = await page.$eval(".portal", (el) => {
    const s = getComputedStyle(el);
    return s.visibility !== "hidden" && parseFloat(s.opacity) > 0.5;
  });
  if (!visible) fail = true;
  await page.screenshot({ path: `${OUT}/portal.png` });
  await page.waitForTimeout(2200);
  const hidden = await page.$eval(".portal", (el) => {
    const s = getComputedStyle(el);
    return s.visibility === "hidden" || parseFloat(s.opacity) < 0.05;
  });
  console.log(`[motion] portal visible=${visible} reversed=${hidden}`);
  await ctx.close();
}

await browser.close();
console.log(`\n=== CONSOLE ERRORS (${errors.length}) ===`);
errors.forEach((e) => console.log(e));
console.log(`\nSMOKE RESULT: ${fail || errors.length ? "FAIL" : "PASS"}`);
process.exit(fail || errors.length ? 1 : 0);
