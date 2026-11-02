// Runbook v4 W8 (performance): five seconds of tile hovering on the home page with motion on, measured
// in the page: frame intervals from requestAnimationFrame and long tasks from PerformanceObserver.
// A "dropped" frame is an interval over 1.5 frames (25 ms at 60 Hz); a cluster is 3 or more in a row.
//   node --experimental-strip-types scripts/v4-frames.mts [baseUrl]
import { chromium } from "@playwright/test";

const BASE = process.argv[2] ?? "http://localhost:4321";
const HOVER_MS = 5000;
const TILES = ["work", "experience", "about", "contact"];

const browser = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });
await page.goto(`${BASE}/`, { waitUntil: "load" });
await page.locator("canvas[data-dot-field][data-ready]").waitFor();
await page.waitForTimeout(1500); // the headline entrance and the first settle

await page.evaluate(() => {
  const w = window as unknown as { __frames: number[]; __long: number[] };
  w.__frames = [];
  w.__long = [];
  let last = performance.now();
  const tick = (t: number) => {
    w.__frames.push(t - last);
    last = t;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  new PerformanceObserver((list) => list.getEntries().forEach((e) => w.__long.push(e.duration))).observe({ type: "longtask", buffered: false });
});

const boxes = await Promise.all(TILES.map((k) => page.locator(`[data-tile="${k}"]`).boundingBox()));
const start = Date.now();
let i = 0;
while (Date.now() - start < HOVER_MS) {
  const b = boxes[i++ % boxes.length];
  if (b) await page.mouse.move(b.x + b.width * 0.5, b.y + b.height * 0.5, { steps: 12 });
  await page.waitForTimeout(250);
  await page.mouse.move(700, 300, { steps: 8 }); // across the dot field, so repulsion runs too
}

const { frames, long } = await page.evaluate(() => {
  const w = window as unknown as { __frames: number[]; __long: number[] };
  return { frames: w.__frames.slice(1), long: w.__long };
});
await browser.close();

const dropped = frames.filter((f) => f > 25);
let run = 0;
let clusters = 0;
for (const f of frames) {
  run = f > 25 ? run + 1 : 0;
  if (run === 3) clusters++;
}
const sorted = [...frames].sort((a, b) => a - b);
const p = (q: number) => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
const result = {
  frames: frames.length,
  meanFps: Number((1000 / (frames.reduce((a, b) => a + b, 0) / frames.length)).toFixed(1)),
  p50Ms: Number(p(0.5).toFixed(1)),
  p95Ms: Number(p(0.95).toFixed(1)),
  maxMs: Number(sorted[sorted.length - 1].toFixed(1)),
  dropped: dropped.length,
  droppedClusters: clusters,
  longTasks: long.length,
  longestTaskMs: long.length ? Math.round(Math.max(...long)) : 0,
};
console.log(JSON.stringify(result, null, 1));
if (clusters > 0 || result.longestTaskMs > 100) process.exitCode = 1;
