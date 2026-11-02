// Captures the live Label Lens app (Srujan's own project, portfolio-facts 2.3) as a
// real screenshot for its cover and case study: desktop and phone, WebP.
import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";

const URL = "https://label-lens-iota.vercel.app";
const browser = await chromium.launch();
for (const [name, viewport, dpr] of [["label-lens-app", { width: 1280, height: 800 }, 1], ["label-lens-app-phone", { width: 390, height: 844 }, 2]] as const) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: dpr });
  const res = await page.goto(URL, { waitUntil: "networkidle", timeout: 45_000 });
  if (!res?.ok()) throw new Error(`${URL} answered ${res?.status()}`);
  await page.waitForTimeout(1500);
  const png = await page.screenshot();
  const webp = await page.evaluate(async (b64) => {
    const bmp = await createImageBitmap(await (await fetch(`data:image/png;base64,${b64}`)).blob());
    const c = new OffscreenCanvas(bmp.width, bmp.height);
    c.getContext("2d")!.drawImage(bmp, 0, 0);
    const buf = new Uint8Array(await (await c.convertToBlob({ type: "image/webp", quality: 0.82 })).arrayBuffer());
    let s = "";
    for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
    return btoa(s);
  }, png.toString("base64"));
  writeFileSync(`public/images/projects/${name}.webp`, Buffer.from(webp, "base64"));
  console.log(name, viewport.width, "x", viewport.height);
  await page.close();
}
await browser.close();
