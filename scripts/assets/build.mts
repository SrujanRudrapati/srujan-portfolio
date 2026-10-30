// Compresses the CC0 sources in assets-src/3d/ (see sources.mts) into the files
// the site ships under public/three/:
//   tex/<id>-color.ktx2   ETC1S, sRGB          (albedo)
//   tex/<id>-normal.ktx2  UASTC + RDO + zstd   (normals; ETC1S blocks show on normals)
//   tex/<id>-orm.ktx2     ETC1S, linear        (G = roughness; R = 1, B = 0)
//   env/<id>-sdr.jpg, env/<id>-gain.jpg, env/<id>.json   HDRI as a gain map
//   basis/ and meshopt decoder copied from three (self-hosted, no CDN).
// Image decoding and the HDR gain-map encode run in headless Chromium (canvas
// and WebGL), so the repo needs no native image tools.
import { copyFileSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { chromium } from "@playwright/test";
import { encodeToKTX2 } from "ktx2-encoder";
import { HDRI, TEXTURES } from "./sources.mts";

const SRC = "assets-src/3d";
const OUT = "public/three";
const ROOT = resolve(".");
for (const d of ["tex", "env", "basis"]) mkdirSync(join(OUT, d), { recursive: true });

const TYPES: Record<string, string> = { ".js": "text/javascript", ".mjs": "text/javascript", ".jpg": "image/jpeg", ".hdr": "application/octet-stream", ".html": "text/html", ".wasm": "application/wasm" };

const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage();
page.on("console", (m) => m.type() === "error" && console.error("[page]", m.text()));
await page.route("http://build.local/**", (route) => {
  const path = new URL(route.request().url()).pathname;
  if (path === "/") {
    return route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><script type="importmap">{"imports":{"three":"/node_modules/three/build/three.module.js","three/addons/":"/node_modules/three/examples/jsm/","@monogrid/gainmap-js/encode":"/node_modules/@monogrid/gainmap-js/dist/encode.js"}}</script><body></body>`,
    });
  }
  const file = join(ROOT, decodeURIComponent(path));
  if (!file.startsWith(ROOT)) return route.fulfill({ status: 403 });
  return route.fulfill({ contentType: TYPES[extname(file)] ?? "application/octet-stream", body: readFileSync(file) });
});
await page.goto("http://build.local/");

// Decode a JPEG in the browser, resize it, and hand back raw RGBA.
async function decode(file: string, size: number, channel?: "g") {
  const b64 = await page.evaluate(
    async ({ url, size, channel }) => {
      const blob = await (await fetch(url)).blob();
      const bmp = await createImageBitmap(blob, { resizeWidth: size, resizeHeight: size, resizeQuality: "high", colorSpaceConversion: "none", premultiplyAlpha: "none" });
      const c = new OffscreenCanvas(size, size);
      const ctx = c.getContext("2d", { colorSpace: "srgb" })!;
      ctx.drawImage(bmp, 0, 0);
      const px = ctx.getImageData(0, 0, size, size).data;
      if (channel === "g") {
        // Roughness lives in G for three's roughnessMap; R = AO (none), B = metalness (unused).
        for (let i = 0; i < px.length; i += 4) {
          const r = px[i];
          px[i] = 255;
          px[i + 1] = r;
          px[i + 2] = 0;
          px[i + 3] = 255;
        }
      }
      let s = "";
      for (let i = 0; i < px.length; i += 0x8000) s += String.fromCharCode(...px.subarray(i, i + 0x8000));
      return btoa(s);
    },
    { url: `http://build.local/${file}`, size, channel },
  );
  return { width: size, height: size, data: new Uint8Array(Buffer.from(b64, "base64")) };
}

const report: string[] = [];
for (const t of TEXTURES) {
  for (const [map, suffix] of Object.entries(t.maps)) {
    const dir = join(SRC, t.asset);
    const file = readdirSync(dir).find((f) => f.endsWith(`_${suffix}.jpg`));
    if (!file) throw new Error(`missing ${suffix} in ${dir}`);
    // Normals at 256: at cover size they only add grain, and UASTC costs 1 byte per texel.
    const raw = await decode(join(dir, file), map === "normal" ? 256 : t.size, map === "roughness" ? "g" : undefined);
    const isNormal = map === "normal";
    const ktx = await encodeToKTX2(new Uint8Array(0), {
      imageDecoder: async () => raw,
      generateMipmap: true,
      isUASTC: isNormal,
      isNormalMap: isNormal,
      isPerceptual: map === "color",
      enableRDO: isNormal,
      rdoQualityLevel: 2,
      needSupercompression: isNormal,
      qualityLevel: map === "color" ? 160 : 110,
      compressionLevel: 4,
    });
    const name = `${t.id}-${map === "roughness" ? "orm" : map}.ktx2`;
    writeFileSync(join(OUT, "tex", name), ktx);
    report.push(`${name} ${(ktx.byteLength / 1024).toFixed(0)} KB`);
  }
}

// HDRI to gain map: an sRGB JPEG plus a gain-map JPEG plus metadata (about a tenth of the .hdr).
const env = await page.evaluate(async (url) => {
  const { HDRLoader } = await import("three/addons/loaders/HDRLoader.js");
  const { encodeAndCompress, findTextureMinMax } = await import("@monogrid/gainmap-js/encode");
  const THREE = await import("three");
  const image = await new HDRLoader().setDataType(THREE.FloatType).loadAsync(url);
  const max = findTextureMinMax(image);
  const r = await encodeAndCompress({ image, maxContentBoost: Math.max(...max), mimeType: "image/jpeg", quality: 0.88, flipY: true });
  const enc = (a: Uint8Array) => {
    let s = "";
    for (let i = 0; i < a.length; i += 0x8000) s += String.fromCharCode(...a.subarray(i, i + 0x8000));
    return btoa(s);
  };
  const meta = { gamma: r.gamma, hdrCapacityMin: r.hdrCapacityMin, hdrCapacityMax: r.hdrCapacityMax, offsetSdr: r.offsetSdr, offsetHdr: r.offsetHdr, gainMapMin: r.gainMapMin, gainMapMax: r.gainMapMax };
  return { sdr: enc(r.sdr.data), gain: enc(r.gainMap.data), meta };
}, `http://build.local/${SRC}/${HDRI.asset}_1k.hdr`);
writeFileSync(join(OUT, "env", `${HDRI.id}-sdr.jpg`), Buffer.from(env.sdr, "base64"));
writeFileSync(join(OUT, "env", `${HDRI.id}-gain.jpg`), Buffer.from(env.gain, "base64"));
writeFileSync(join(OUT, "env", `${HDRI.id}.json`), JSON.stringify(env.meta));
await browser.close();

// Self-hosted decoders (never a CDN).
for (const f of ["basis_transcoder.js", "basis_transcoder.wasm"]) copyFileSync(`node_modules/three/examples/jsm/libs/basis/${f}`, join(OUT, "basis", f));

for (const d of ["tex", "env", "basis"]) for (const f of readdirSync(join(OUT, d))) if (!report.some((r) => r.startsWith(f))) report.push(`${d}/${f} ${(statSync(join(OUT, d, f)).size / 1024).toFixed(0)} KB`);
console.log(report.join("\n"));
