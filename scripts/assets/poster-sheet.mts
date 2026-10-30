// Review aid: renders every poster over white and black into one image (alpha check for both themes).
// Usage: node --experimental-strip-types scripts/assets/poster-sheet.mts out.png
import { chromium } from "@playwright/test";
import { readFileSync, readdirSync } from "node:fs";
const files = readdirSync("public/posters").filter((f) => f.endsWith(".webp"));
const imgs = files.map((f) => `<figure><img src="data:image/webp;base64,${readFileSync(`public/posters/${f}`).toString("base64")}"><figcaption>${f}</figcaption></figure>`).join("");
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
await p.setContent(`<style>body{margin:0;display:grid;grid-template-columns:1fr 1fr}section{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px}img{width:100%}figcaption{font:12px monospace;color:#888}</style><section style="background:#fff">${imgs}</section><section style="background:#000">${imgs}</section>`);
await p.screenshot({ path: process.argv[2], fullPage: true });
await b.close();
