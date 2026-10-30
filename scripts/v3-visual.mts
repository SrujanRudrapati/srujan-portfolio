// Evidence for runbook V1.5: screenshots of /lab/a (1440 and 390, light and dark,
// first screen plus scroll steps), a reduced-motion full page, a scroll video, and
// frame timing while scrolling with the real GPU.
// Usage: node --experimental-strip-types scripts/v3-visual.mts [baseUrl] [path] [outDir]
import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import { chromium, type Page } from "@playwright/test";

const base = process.argv[2] ?? "http://localhost:4321";
const path = process.argv[3] ?? "/lab/a";
const OUT = process.argv[4] ?? "docs/v3/visual";
const GPU = ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"];
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "chromium", args: GPU });
const errors: string[] = [];

async function open(page: Page) {
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && !m.text().includes("favicon") && errors.push(m.text()));
  await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
  // Covers go live only once on screen, so wait only when one starts in the first viewport.
  const sceneAboveFold = await page.$$eval("[data-scene]", (els) => els.some((e) => e.getBoundingClientRect().top < innerHeight));
  if (sceneAboveFold) await page.waitForFunction(() => document.querySelectorAll("[data-live]").length >= 1, null, { timeout: 30_000 }).catch(() => errors.push("no live scene within 30 s"));
  await page.waitForTimeout(2500);
}

async function steps(name: string, viewport: { width: number; height: number }, theme: "light" | "dark") {
  const dir = `${OUT}/${name}`;
  mkdirSync(dir, { recursive: true });
  const page = await browser.newPage({ viewport, colorScheme: theme, deviceScaleFactor: 1 });
  await open(page);
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  let i = 0;
  for (let y = 0; y < height && i < 12; y += viewport.height * 0.9, i++) {
    await page.mouse.wheel(0, i === 0 ? 0 : viewport.height * 0.9);
    await page.waitForTimeout(1800);
    await page.screenshot({ path: `${dir}/${String(i).padStart(2, "0")}.jpg`, type: "jpeg", quality: 78 });
  }
  await page.close();
}

await steps("desktop-light", { width: 1440, height: 900 }, "light");
await steps("desktop-dark", { width: 1440, height: 900 }, "dark");
await steps("mobile-light", { width: 390, height: 844 }, "light");

// Reduced motion: posters only, nothing moves, the page reads in full.
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const live = await page.$$eval("[data-live]", (e) => e.length);
  const canvases = await page.$$eval("canvas", (e) => e.length);
  if (live || canvases) errors.push(`reduced motion started WebGL (${canvases} canvas, ${live} live views)`);
  mkdirSync(`${OUT}/reduced`, { recursive: true });
  await page.screenshot({ path: `${OUT}/reduced/full.jpg`, type: "jpeg", quality: 70, fullPage: true });
  await page.close();
}

// Scroll video at 1440 and frame timing on the GPU.
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: OUT, size: { width: 1440, height: 900 } } });
const page = await ctx.newPage();
await open(page);
await page.evaluate(() => {
  const w = window as unknown as { __frames: number[] };
  w.__frames = [];
  const tick = (t: number) => {
    w.__frames.push(t);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});
for (let i = 0; i < 60; i++) {
  await page.mouse.wheel(0, 90);
  await page.waitForTimeout(120);
}
await page.waitForTimeout(1500);
for (let i = 0; i < 20; i++) {
  await page.mouse.wheel(0, -120);
  await page.waitForTimeout(100);
}
const frames = await page.evaluate(() => (window as unknown as { __frames: number[] }).__frames);
const gaps = frames.slice(1).map((t, i) => t - frames[i]);
const sorted = [...gaps].sort((a, b) => a - b);
const timing = {
  frames: gaps.length,
  meanFps: +(1000 / (gaps.reduce((a, b) => a + b, 0) / gaps.length)).toFixed(1),
  p95FrameMs: +sorted[Math.floor(sorted.length * 0.95)].toFixed(1),
  over33ms: gaps.filter((g) => g > 33.4).length,
  gpu: await page.evaluate(() => {
    const gl = document.createElement("canvas").getContext("webgl2");
    const e = gl?.getExtension("WEBGL_debug_renderer_info");
    return gl && e ? String(gl.getParameter(e.UNMASKED_RENDERER_WEBGL)) : "unknown";
  }),
};
const video = page.video();
await ctx.close();
if (video) renameSync(await video.path(), `${OUT}/scroll-1440.webm`);
await browser.close();

writeFileSync(`${OUT}/timing.json`, JSON.stringify(timing, null, 2));
console.log(timing);
if (errors.length) {
  console.error([...new Set(errors)].join("\n"));
  process.exit(1);
}
