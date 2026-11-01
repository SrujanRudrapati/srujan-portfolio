// Runbook V7 "feel check": 20 s scroll videos of the home page and one case study at 1440 and 390,
// plus a reduced-motion run, into docs/v3/final/. Needs the export served: npx serve out -l 4321.
//   node --experimental-strip-types scripts/v3-final-videos.mts [base]
import { mkdirSync, renameSync } from "node:fs";
import { chromium, devices, type BrowserContextOptions } from "@playwright/test";

const base = process.argv[2] ?? "http://localhost:4321";
const OUT = "docs/v3/final";
mkdirSync(OUT, { recursive: true });

const RUNS: { name: string; path: string; ctx: BrowserContextOptions }[] = [
  { name: "home-1440", path: "/", ctx: { viewport: { width: 1440, height: 900 } } },
  { name: "home-390", path: "/", ctx: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } } },
  { name: "case-surplus-ai-1440", path: "/work/surplus-ai", ctx: { viewport: { width: 1440, height: 900 } } },
  { name: "case-surplus-ai-390", path: "/work/surplus-ai", ctx: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } } },
  { name: "reduced-motion-home-1440", path: "/", ctx: { viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" } },
];
const SECONDS = 20;

const browser = await chromium.launch({ channel: "chrome", args: ["--enable-gpu", "--ignore-gpu-blocklist"] });
for (const run of RUNS) {
  const size = run.ctx.viewport!;
  const ctx = await browser.newContext({ ...run.ctx, recordVideo: { dir: OUT, size } });
  await ctx.addInitScript(() => sessionStorage.setItem("intro", "1"));
  const page = await ctx.newPage();
  await page.goto(`${base}${run.path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  // A steady scroll from top to bottom over SECONDS, like a person reading quickly.
  await page.evaluate(async (s) => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const t0 = performance.now();
    await new Promise<void>((done) => {
      const f = (t: number) => {
        const k = Math.min(1, (t - t0) / (s * 1000));
        window.scrollTo(0, max * k);
        if (k < 1) requestAnimationFrame(f);
        else done();
      };
      requestAnimationFrame(f);
    });
  }, SECONDS);
  await page.waitForTimeout(800);
  const video = page.video();
  await ctx.close();
  if (video) renameSync(await video.path(), `${OUT}/${run.name}.webm`);
  console.log(run.name);
}
await browser.close();
