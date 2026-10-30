// Release gate for runbook Phase 11 step 1: the static export must contain
// every file the site links to or fetches. Fails (exit 1) on anything missing.
//   npm run release:check     (after npm run build)
import { existsSync, readFileSync } from "node:fs";

const required = [".nojekyll", "index.html", "404.html", "resume.pdf", "graph.json", "search-index.json", "og.png", "sitemap.xml", "robots.txt"];
const missing = required.filter((f) => !existsSync(`out/${f}`));

// Every hand-written root-relative href or src in the page (outside _next) must exist in out/.
const html = readFileSync("out/index.html", "utf8");
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const refs = [...html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)].map((m) => m[1]).filter((u) => !u.includes("/_next/"));
const broken = [...new Set(refs)].map((u) => u.slice(base.length) || "/").filter((u) => u !== "/" && !existsSync(`out${u}`));

if (missing.length || broken.length) {
  if (missing.length) console.error(`missing from out/: ${missing.join(", ")}`);
  if (broken.length) console.error(`linked from index.html but absent: ${broken.join(", ")}`);
  process.exit(1);
}
console.log(`release check ok: ${required.length} required files present, ${refs.length} root-relative links resolve`);
