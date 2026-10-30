// Phase V1 evidence: screenshots and a ~10 s scroll video of each /lab prototype
// at 1440 and 390, light and dark, plus a reduced-motion pass. Console errors fail the run.
// Usage: node --experimental-strip-types scripts/v3-concepts.mts [--base http://localhost:3000] [--only a]
import { chromium, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const arg = (name: string, fallback: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const BASE = arg("base", "http://localhost:3000");
const ONLY = arg("only", "a,b,c").split(",");
const OUT = "docs/v3/concepts";

const VIEWS = [
  { name: "desktop", width: 1440, height: 900, mobile: false },
  { name: "mobile", width: 390, height: 844, mobile: true },
];

async function scrollSteps(page: Page, height: number, mobile: boolean, onStep: (i: number) => Promise<void>) {
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const steps = Math.min(14, Math.ceil(total / height) + 1);
  for (let i = 1; i <= steps; i++) {
    if (mobile) {
      await page.evaluate((y) => window.scrollTo(0, y), i * height * 0.9);
    } else {
      for (let k = 0; k < 6; k++) {
        await page.mouse.wheel(0, (height * 0.9) / 6);
        await page.waitForTimeout(70);
      }
    }
    await page.waitForTimeout(650);
    await onStep(i);
  }
}

const browser = await chromium.launch();
const errors: string[] = [];
for (const id of ONLY) {
  for (const view of VIEWS) {
    for (const scheme of ["light", "dark"] as const) {
      const dir = path.join(OUT, id, `${view.name}-${scheme}`);
      fs.rmSync(dir, { recursive: true, force: true });
      fs.mkdirSync(dir, { recursive: true });
      const video = scheme === "light" ? { dir, size: { width: view.mobile ? 390 : 960, height: view.mobile ? 844 : 600 } } : undefined;
      const ctx = await browser.newContext({ viewport: { width: view.width, height: view.height }, isMobile: view.mobile, hasTouch: view.mobile, colorScheme: scheme, recordVideo: video });
      const page = await ctx.newPage();
      page.on("console", (m) => m.type() === "error" && errors.push(`${id} ${view.name} ${scheme}: ${m.text()}`));
      page.on("pageerror", (e) => errors.push(`${id} ${view.name} ${scheme}: ${e.message}`));
      await page.goto(`${BASE}/lab/${id}`, { waitUntil: "networkidle" });
      await page.mouse.move(view.width / 2, view.height / 2);
      await page.waitForTimeout(1400);
      await page.screenshot({ path: path.join(dir, "00.png") });
      await scrollSteps(page, view.height, view.mobile, (i) => page.screenshot({ path: path.join(dir, `${String(i).padStart(2, "0")}.png`) }).then(() => undefined));
      await ctx.close();
      for (const f of fs.readdirSync(dir)) if (f.endsWith(".webm") && f !== "scroll.webm") fs.renameSync(path.join(dir, f), path.join(dir, "scroll.webm"));
    }
  }
  // Reduced motion: final state, native scroll, nothing pinned.
  const dir = path.join(OUT, id, "reduced");
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${id} reduced: ${e.message}`));
  await page.goto(`${BASE}/lab/${id}`, { waitUntil: "networkidle" });
  const motionAttr = await page.evaluate(() => document.querySelector("[data-motion]") !== null);
  if (motionAttr) errors.push(`${id} reduced: motion layer started under prefers-reduced-motion`);
  await page.screenshot({ path: path.join(dir, "full.png"), fullPage: true });
  await ctx.close();
}
await browser.close();
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`ok: ${ONLY.join(", ")}`);
