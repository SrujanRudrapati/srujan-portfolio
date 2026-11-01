// Runbook v4 G5 / W8: put each site shot beside its reference shot.
// Usage: node --experimental-strip-types scripts/v4-compare.mts [siteDir] [refDir] [outDir] [view,view,...]
// Output: <outDir>/<viewport>/<view>.jpg with the reference on the left and the site on the right.
// Images are inlined as data URLs (a page set with setContent cannot load file:// images).
import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { chromium } from "@playwright/test";

const SITE = process.argv[2] ?? "docs/v4/site-shots";
const REF = process.argv[3] ?? "docs/v4/reference-shots";
const OUT = process.argv[4] ?? "docs/v4/compare";
const VIEWS = process.argv[5]?.split(",");
const GAP = 24;
const LABEL_H = 36;

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });
let made = 0;
for (const vp of readdirSync(SITE)) {
  const [w, h] = vp.split("x").map(Number);
  mkdirSync(`${OUT}/${vp}`, { recursive: true });
  for (const file of readdirSync(`${SITE}/${vp}`)) {
    const view = file.replace(/\.jpg$/, "");
    if (VIEWS && !VIEWS.includes(view)) continue;
    const ref = `${REF}/${vp}/${file}`;
    const img = (p: string) => (existsSync(p) ? `<img src="data:image/jpeg;base64,${readFileSync(p).toString("base64")}" width="${w}" height="${h}">` : `<div class="none" style="width:${w}px;height:${h}px">no reference shot</div>`);
    await page.setViewportSize({ width: w * 2 + GAP * 3, height: h + LABEL_H + GAP * 2 });
    await page.setContent(`<style>body{margin:0;background:#05070a;color:#8d98a5;font:14px system-ui;display:flex;gap:${GAP}px;padding:${GAP}px}figure{margin:0}figcaption{height:${LABEL_H}px}.none{display:grid;place-items:center;border:1px dashed #333}</style>
      <figure><figcaption>Reference, ${vp}, ${view}</figcaption>${img(ref)}</figure>
      <figure><figcaption>Site, ${vp}, ${view}</figcaption>${img(`${SITE}/${vp}/${file}`)}</figure>`);
    await page.waitForLoadState("load");
    await page.screenshot({ path: `${OUT}/${vp}/${view}.jpg`, type: "jpeg", quality: 72 });
    made++;
  }
}
await browser.close();
console.log(`${made} comparisons in ${OUT}`);
