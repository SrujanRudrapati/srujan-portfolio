// Renders public/og.png (1200x630, the size LinkedIn and others use for link previews) in the v5
// "Thread" style with the site's own Archivo and IBM Plex Mono. Needs a fresh `npm run build`
// served at the given URL (without the base path), since it borrows the fonts from out/.
// Rerun when the hero copy changes; every word comes from src/data/home.ts.
//   node --experimental-strip-types scripts/og-image.mts http://localhost:4321
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";
import { hero } from "../src/data/home.ts";
import { THEMES } from "../src/lib/themes.ts";

const [ground, ink, thread] = THEMES.paper;
const base = process.argv[2] ?? "http://localhost:4321";
const home = await (await fetch(`${base}/`)).text();
const cssFiles = [...home.matchAll(/chunks\/([a-z0-9_-]+\.css)/g)].map((m) => m[1]);
if (cssFiles.length === 0) throw new Error(`no stylesheet found at ${base}/ (build and serve the site first)`);
const css = cssFiles.map((f) => readFileSync(new URL(`../out/_next/static/chunks/${f}`, import.meta.url), "utf8")).join("\n");
const fontFaces = (css.match(/@font-face\{[^}]*\}/g) ?? []).map((f) => f.replace(/url\(\.\.\/media\//g, `url(${base}/_next/static/media/`)).join("\n");
// The variable names next/font gave the two families.
const family = (name: string) => css.match(new RegExp(`font-family:([^;}]*${name}[^;}]*)`))?.[1] ?? name;

// Letters alternate over and under the thread, as on the site.
const woven = (word: string, offset: number) =>
  [...word].map((ch, i) => `<span class="${(i + offset) % 2 ? "u" : "o"}">${ch}</span>`).join("");

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
${fontFaces}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;overflow:hidden;position:relative;background:${ground};color:${ink};font-family:${family("Archivo")};padding:56px 64px}
.mono{font-family:${family("Plex")};font-size:18px;text-transform:uppercase;letter-spacing:.07em}
.top{display:flex;justify-content:space-between}
.giant{margin-top:40px;font-weight:900;font-stretch:125%;font-variation-settings:"wdth" 125;text-transform:uppercase;line-height:.82;letter-spacing:-.01em}
.giant div{white-space:nowrap}
.giant span{position:relative;display:inline-block}
.o{z-index:3}.u{z-index:1}
.l1{font-size:150px}.l2{font-size:122px}
h1{position:relative;z-index:3;margin-top:34px;font-size:30px;line-height:1.18;font-weight:600;letter-spacing:-.02em;max-width:30em}
.foot{position:absolute;left:64px;right:64px;bottom:44px;display:flex;justify-content:space-between;gap:24px}
.url{text-transform:none;letter-spacing:0}
svg{position:absolute;inset:0;z-index:2}
</style></head><body>
<svg width="1200" height="630" viewBox="0 0 1200 630" aria-hidden="true"><path d="M1150 104C860 110 260 146 40 200S280 270 640 254 1210 236 1110 334" fill="none" stroke="${thread}" stroke-width="4" stroke-linecap="round"/><circle cx="1110" cy="334" r="8" fill="${thread}"/></svg>
<div class="top mono"><span>${hero.roles} · ${hero.place}</span><span class="url">srujanrudrapati.github.io/srujan-portfolio</span></div>
<div class="giant"><div class="l1">${woven(hero.lines[0], 0)}</div><div class="l2">${woven(hero.lines[1], hero.lines[0].length)}</div></div>
<h1>${hero.headline}</h1>
<div class="foot mono"><span>${hero.availability}</span></div>
</body></html>`;

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
// A temporary file inside out/ is same-origin with the font files and runs none of the site's scripts.
const tmp = new URL("../out/og-render.html", import.meta.url);
writeFileSync(tmp, html);
try {
  await page.goto(`${base}/og-render.html`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const overflow = await page.evaluate(() => [...document.querySelectorAll("body *")].some((el) => el.getBoundingClientRect().right > 1200 + 1));
  if (overflow) throw new Error("og image: something runs past 1200px; shorten the copy or shrink the type");
  await page.screenshot({ path: "public/og.png" });
} finally {
  rmSync(tmp, { force: true });
  await browser.close();
}
console.log("wrote public/og.png");
