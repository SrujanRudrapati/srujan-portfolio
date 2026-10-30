// Downloads the CC0 sources listed in sources.mts into assets-src/3d/.
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { HDRI, TEXTURES } from "./sources.mts";

const OUT = "assets-src/3d";
mkdirSync(OUT, { recursive: true });

async function download(url: string, file: string) {
  if (existsSync(file)) return;
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`download failed ${res.status}: ${url}`);
  writeFileSync(file, new Uint8Array(await res.arrayBuffer()));
  console.log(`fetched ${url}`);
}

for (const t of TEXTURES) {
  const zip = join(OUT, `${t.asset}.zip`);
  await download(t.url, zip);
  const dir = join(OUT, t.asset);
  if (!existsSync(dir)) execFileSync("unzip", ["-q", "-o", zip, "-d", dir]);
}

const hdr = join(OUT, `${HDRI.asset}_1k.hdr`);
await download(HDRI.url, hdr);
const md5 = createHash("md5").update(readFileSync(hdr)).digest("hex");
if (md5 !== HDRI.md5) throw new Error(`HDRI checksum mismatch: ${md5}`);
console.log("sources ready in", OUT);
