// Release gate for runbook Phase 11 step 1: the static export must contain
// every file the site links to or fetches. Fails (exit 1) on anything missing.
//   npm run release:check              (CI-parity build, then check)
//   npm run release:check -- --no-build  (check the existing out/)
// The base path defaults to the GitHub Pages prefix, so an unset env var or a
// stale out/ can no longer produce a false failure.
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const PAGES_BASE_PATH = "/srujan-portfolio";
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? PAGES_BASE_PATH;

if (!process.argv.includes("--no-build")) {
  execSync("npm run build", { stdio: "inherit", env: { ...process.env, NEXT_PUBLIC_BASE_PATH: base } });
}

const required = [".nojekyll", "index.html", "404.html", "resume.pdf", "graph.json", "search-index.json", "og.png", "sitemap.xml", "robots.txt"];
const missing = required.filter((f) => !existsSync(`out/${f}`));
// Tooling routes must never ship: /studio exists only in a POSTER_STUDIO=1 build, /lab was removed in V7.
const forbidden = ["studio", "studio.html", "lab", "lab.html"].filter((f) => existsSync(`out/${f}`));

// Every hand-written root-relative href or src in the page (outside _next) must exist in out/.
const html = readFileSync("out/index.html", "utf8");
if (!html.includes(`"${base}/_next/`)) {
  console.error(`out/ was not built with base path "${base}"; run npm run release:check without --no-build`);
  process.exit(1);
}
const refs = [...html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)].map((m) => m[1]).filter((u) => !u.includes("/_next/"));
const broken = [...new Set(refs)].map((u) => u.slice(base.length) || "/").filter((u) => u !== "/" && !existsSync(`out${u}`));

if (missing.length || broken.length || forbidden.length) {
  if (missing.length) console.error(`missing from out/: ${missing.join(", ")}`);
  if (forbidden.length) console.error(`tooling routes in out/ (rebuild without POSTER_STUDIO): ${forbidden.join(", ")}`);
  if (broken.length) console.error(`linked from index.html but absent: ${broken.join(", ")}`);
  process.exit(1);
}
console.log(`release check ok: ${required.length} required files present, ${refs.length} root-relative links resolve`);
