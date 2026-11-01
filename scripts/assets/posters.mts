// Renders a static poster of every 3D scene (motion-system: poster first) into
// public/posters/<id>.webp. Posters are what visitors see before the live view
// is ready, under reduced motion, on low-power devices, and if WebGL fails.
// Usage: npm run posters [-- http://localhost:3000]  (needs `POSTER_STUDIO=1 npm run dev` running: the
// studio route only exists when that variable adds the .studio.tsx page extension, see next.config.ts)
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";

const base = process.argv[2] ?? "http://localhost:3000";
const OUT = "public/posters";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 5400 }, deviceScaleFactor: 1 });
await page.addInitScript(() => sessionStorage.setItem("intro", "1")); // no first-visit intro over the capture
const errors: string[] = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(`${base}/studio/posters`, { waitUntil: "networkidle" });
await page.addStyleTag({ content: "html, body, main { background: transparent !important; } nextjs-portal, body > header, body > footer { display: none !important; }" });
const ids = await page.$$eval("[data-poster]", (els) => els.map((e) => e.getAttribute("data-poster")!));
await page.waitForFunction((n) => document.querySelectorAll("[data-live]").length === n, ids.length, { timeout: 120_000 });
await page.waitForTimeout(1500);

for (const id of ids) {
  const png = await page.locator(`[data-poster="${id}"]`).screenshot({ omitBackground: true });
  const webp = await page.evaluate(async (b64) => {
    const blob = await (await fetch(`data:image/png;base64,${b64}`)).blob();
    const bmp = await createImageBitmap(blob);
    const c = new OffscreenCanvas(bmp.width, bmp.height);
    c.getContext("2d")!.drawImage(bmp, 0, 0);
    const out = await c.convertToBlob({ type: "image/webp", quality: 0.82 });
    const buf = new Uint8Array(await out.arrayBuffer());
    let s = "";
    for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
    return btoa(s);
  }, png.toString("base64"));
  const bytes = Buffer.from(webp, "base64");
  writeFileSync(`${OUT}/${id}.webp`, bytes);
  console.log(`${id}.webp ${(bytes.length / 1024).toFixed(0)} KB`);
}
await browser.close();
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
