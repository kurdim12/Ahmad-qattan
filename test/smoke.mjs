// Headless smoke test for the Night Road.
//
//   1) npm run build && npm run preview     # serves ./out on :3000
//   2) npm i -D playwright  (chromium via PW_EXECUTABLE or playwright install)
//   3) BASE_URL=http://localhost:3000 node test/smoke.mjs
//
// Checks: night theme, all scenes present, THE line drawn + head riding,
// odometer calibration (٤٧ at the end), locale/RTL mirror, dawn inversion,
// portal demo, no horizontal overflow, reduced-motion static world.

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
let fail = false;
const launchOpts = process.env.PW_EXECUTABLE
  ? { executablePath: process.env.PW_EXECUTABLE }
  : {};
const browser = await chromium.launch(launchOpts);

async function newPage(opts) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  page.on("console", (m) => m.type() === "error" && errors.push(`[${opts.label}] ${m.text()}`));
  page.on("pageerror", (e) => errors.push(`[${opts.label}] ${e.message}`));
  return { ctx, page };
}

const check = (label, ok) => {
  console.log(`${ok ? "✓" : "✗"} ${label}`);
  if (!ok) fail = true;
};

// 1) Desktop journey
{
  const { ctx, page } = await newPage({
    viewport: { width: 1440, height: 900 },
    label: "desktop",
  });
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(3400); // preloader

  check(
    "night page background",
    (await page.evaluate(() => getComputedStyle(document.body).backgroundColor)) ===
      "rgb(11, 9, 6)",
  );
  check("nine scenes", (await page.$$("[data-scene-key]")).length === 9);
  const d = await page.$eval(".road-line__base", (p) => p.getAttribute("d") || "");
  check(`line drawn (${d.length} chars)`, d.length > 400);
  check("head present", (await page.$(".road-line__head")) !== null);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  check("no horizontal overflow", overflow <= 1);

  // Dawn inversion at the fork
  await page.evaluate(() => {
    const el = document.querySelector('[data-scene-key="fork"]');
    const r = el.getBoundingClientRect();
    window.scrollTo({ top: r.top + scrollY + r.height / 2 - innerHeight * 0.5, behavior: "instant" });
  });
  await page.waitForTimeout(900);
  check(
    "dawn inversion at the arch",
    await page.evaluate(() => document.documentElement.classList.contains("is-dawn")),
  );
  await page.screenshot({ path: `${OUT}/fork-dawn.png` });

  // Portal demo (placeholder URL → no navigation)
  const btn = await page.$(".gateway__btn");
  if (btn) {
    await btn.click();
    await page.waitForTimeout(500);
    check(
      "portal plays",
      await page.$eval(".portal", (el) => {
        const s = getComputedStyle(el);
        return s.visibility !== "hidden" && parseFloat(s.opacity) > 0.5;
      }),
    );
    await page.waitForTimeout(2400);
  } else check("portal plays", false);

  // Odometer ends at ٤٧
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
  await page.waitForTimeout(900);
  const km = await page.$eval(".odometer__value", (el) => el.textContent);
  check(`odometer reads ٤٧ at Amman (got ${km})`, km === "٤٧");
  check(
    "night restored after dawn",
    await page.evaluate(() => !document.documentElement.classList.contains("is-dawn")),
  );

  // Locale mirror
  await page.click(".locale-toggle");
  await page.waitForTimeout(600);
  const dir = await page.evaluate(() => document.documentElement.dir);
  const lang = await page.evaluate(() => document.documentElement.lang);
  check(`locale mirror (dir=${dir} lang=${lang})`, dir === "ltr" && lang === "en");
  await ctx.close();
}

// 2) Mobile portrait
{
  const { ctx, page } = await newPage({
    viewport: { width: 390, height: 844 },
    label: "mobile",
  });
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(3400);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  check("mobile: no horizontal overflow", overflow <= 1);
  const src = await page.$eval(".scene--world .scene__media", (i) => i.currentSrc);
  check("mobile: portrait variant served", /portrait/.test(src));
  await ctx.close();
}

// 3) Reduced motion: static world, line fully drawn
{
  const { ctx, page } = await newPage({
    viewport: { width: 1280, height: 800 },
    reducedMotion: "reduce",
    label: "reduced",
  });
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  check(
    "reduced: no preloader lock",
    await page.evaluate(() => !document.documentElement.classList.contains("is-loading")),
  );
  const dash = await page.$eval(".road-line__trail", (p) => p.style.strokeDasharray);
  check(`reduced: line fully drawn (dasharray="${dash}")`, dash === "none" || dash === "");
  await ctx.close();
}

await browser.close();
console.log(`\n=== CONSOLE ERRORS (${errors.length}) ===`);
errors.forEach((e) => console.log(e));
console.log(`\nSMOKE RESULT: ${fail || errors.length ? "FAIL" : "PASS"}`);
process.exit(fail || errors.length ? 1 : 0);
