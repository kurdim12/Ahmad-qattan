// Headless smoke test for THE JOURNEY acceptance criteria:
// no horizontal overflow, the road draws, 7 chapter waypoints anchor the line,
// locale/RTL toggle works, the crossing portal plays + reverses.
//
//   1) npm run build && npm run preview     # serves ./out on :3000
//   2) npm i -D playwright  (Chromium via PW_EXECUTABLE if preinstalled)
//   3) BASE_URL=http://localhost:3000 node test/smoke.mjs
//
// Env overrides: BASE_URL, PW_EXECUTABLE, SHOTS.

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const OUT = process.env.SHOTS || "/tmp/shots";

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.log("playwright not installed — skipping smoke test.");
  process.exit(0);
}

import { mkdirSync } from "fs";
mkdirSync(OUT, { recursive: true });

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

async function travel(page) {
  await page.evaluate(async () => {
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y <= h; y += Math.round(window.innerHeight * 0.5)) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 140));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 200));
  });
}

async function report(page, label) {
  const waypoints = await page.$$eval("[data-marker]", (els) => els.length);
  const chapters = await page.$$eval("[data-chapter]", (els) => els.length);
  const scenes = await page.$$eval(".scene img", (els) =>
    els.filter((i) => i.naturalWidth > 0).length,
  );
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  console.log(
    `[${label}] chapters=${chapters} waypoints=${waypoints} scenes-loaded=${scenes} | h-overflow=${overflow}px`,
  );
  return { waypoints, chapters, overflow };
}

// 1) Desktop layout (reduced motion = stable final layout, intro skipped)
{
  const { ctx, page } = await newPage({
    viewport: { width: 1280, height: 900 },
    reducedMotion: "reduce",
    label: "desktop",
  });
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await travel(page);
  const r = await report(page, "desktop");
  if (r.overflow > 1 || r.chapters !== 7 || r.waypoints < 7) fail = true;
  await page.screenshot({ path: `${OUT}/desktop.png` });
  await ctx.close();
}

// 2) Mobile
{
  const { ctx, page } = await newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
    label: "mobile",
  });
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await travel(page);
  const r = await report(page, "mobile");
  if (r.overflow > 1 || r.chapters !== 7) fail = true;
  await ctx.close();
}

// 3) Motion: intro plays, road draws, traveler exists, locale toggle, portal
{
  const { ctx, page } = await newPage({ viewport: { width: 1280, height: 900 }, label: "motion" });
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(3400); // let the opening sequence finish
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

  await page.evaluate(() =>
    document.querySelector(".crossing")?.scrollIntoView({ block: "center" }),
  );
  await page.waitForTimeout(900);
  await (await page.$(".btn--gate")).click();
  await page.waitForTimeout(450);
  const visible = await page.$eval(".portal", (el) => {
    const s = getComputedStyle(el);
    return s.visibility !== "hidden" && parseFloat(s.opacity) > 0.5;
  });
  if (!visible) fail = true;
  await page.screenshot({ path: `${OUT}/portal.png` });
  await page.waitForTimeout(2400);
  const hidden = await page.$eval(".portal", (el) => {
    const s = getComputedStyle(el);
    return s.visibility === "hidden" || parseFloat(s.opacity) < 0.05;
  });
  console.log(`[motion] portal visible=${visible} reversed=${hidden}`);
  if (!hidden) fail = true;
  await ctx.close();
}

await browser.close();
console.log(`\n=== CONSOLE ERRORS (${errors.length}) ===`);
errors.forEach((e) => console.log(e));
console.log(`\nSMOKE RESULT: ${fail || errors.length ? "FAIL" : "PASS"}`);
process.exit(fail || errors.length ? 1 : 0);
