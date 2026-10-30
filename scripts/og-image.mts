// Renders public/og.png (1200x630) in the Spec sheet style with the site's own
// Archivo build. Needs a fresh `npm run build` served at the given URL, since
// it borrows the font from out/. Rerun when the headline or proof changes.
//   node --experimental-strip-types scripts/og-image.mts http://localhost:4321
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";
import { profile } from "../src/content/profile.ts";
import { graph } from "../src/data/graph.ts";
import { selectRecruiter } from "../src/data/graph/lenses.ts";

// The lead headline figure (Recruiter mode order), so the card never drifts from the data. One red figure only.
const lead = selectRecruiter(graph).metrics[0];
if (!lead) throw new Error("no headline metric in the graph");

const base = process.argv[2] ?? "http://localhost:4321";
const css = readFileSync(new URL(`../out/_next/static/chunks/${(await (await fetch(`${base}/`)).text()).match(/chunks\/([a-z0-9_-]+\.css)/)?.[1]}`, import.meta.url), "utf8");
const fontFaces = (css.match(/@font-face\{[^}]*\}/g) ?? []).map((f) => f.replace(/url\(\.\.\/media\//g, `url(${base}/_next/static/media/`)).join("\n");

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
${fontFaces}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:#F6F6F3;color:#0A0A0A;font-family:Archivo,sans-serif;padding:72px 80px;display:grid;grid-template-columns:7fr 5fr;gap:56px;border-top:12px solid #0A0A0A}
h1{font-size:64px;line-height:1;font-weight:700;font-stretch:125%;letter-spacing:-0.02em}
.name{font-size:24px;font-weight:700;font-stretch:125%;margin-bottom:40px}
.sub{margin-top:28px;font-size:26px;line-height:1.35;max-width:30ch}
.now{margin-top:20px;font-size:20px;color:#55554F}
.right{display:flex;flex-direction:column;justify-content:flex-end;gap:18px}
.stat{border-top:3px solid #0A0A0A;padding-top:14px}
.v{font-size:56px;line-height:1;font-weight:700;font-stretch:125%;color:#C42A14}
.l{margin-top:8px;font-size:19px;color:#0A0A0A}
.u{position:absolute;right:80px;top:84px;font-size:18px;color:#1B4FD8;font-weight:500}
</style></head><body>
<div><p class="name">${profile.name}</p><h1>${profile.headline}</h1><p class="sub">${profile.subline}</p><p class="now">${profile.now}</p></div>
<div class="right">
 <div class="stat"><p class="v">${lead.value}</p><p class="l">${lead.label}, ${lead.source}</p></div>
</div>
<p class="u">srujanrudrapati.github.io/srujan-portfolio</p>
</body></html>`;

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
// A temporary file inside out/ is same-origin with the font files and runs none of the site's scripts.
const tmp = new URL("../out/og-render.html", import.meta.url);
writeFileSync(tmp, html);
try {
  await page.goto(`${base}/og-render.html`, { waitUntil: "networkidle" });
} finally {
  rmSync(tmp);
}
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: "public/og.png" });
await browser.close();
console.log("wrote public/og.png");
