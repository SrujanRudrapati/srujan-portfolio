// Lighthouse three times against the static export served locally; prints the median of each
// category (runbook Phase 9; v4 W8 adds the desktop preset).
//   node --experimental-strip-types scripts/lighthouse.mts [url] [runs] [mobile|desktop]
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const url = process.argv[2] ?? "http://localhost:4321/";
const runs = Number(process.argv[3] ?? 3);
const formFactor = process.argv[4] === "desktop" ? "desktop" : "mobile";
const preset = formFactor === "desktop" ? ["--preset=desktop"] : ["--form-factor=mobile"];
const dir = mkdtempSync(join(tmpdir(), "lh-"));
const cats = ["performance", "accessibility", "best-practices", "seo"] as const;
const scores: Record<string, number[]> = Object.fromEntries(cats.map((c) => [c, []]));
const metrics: Record<string, number[]> = { lcp: [], tbt: [], cls: [], fcp: [] };

for (let i = 0; i < runs; i++) {
  const out = join(dir, `run-${i}.json`);
  const r = spawnSync("npx", ["lighthouse", url, "--quiet", "--output=json", `--output-path=${out}`, "--chrome-flags=--headless=new", ...preset], { stdio: "inherit" });
  if (r.status !== 0) throw new Error(`lighthouse run ${i + 1} failed`);
  const report = JSON.parse(readFileSync(out, "utf8"));
  for (const c of cats) scores[c].push(Math.round(report.categories[c].score * 100));
  metrics.lcp.push(report.audits["largest-contentful-paint"].numericValue);
  metrics.tbt.push(report.audits["total-blocking-time"].numericValue);
  metrics.cls.push(report.audits["cumulative-layout-shift"].numericValue);
  metrics.fcp.push(report.audits["first-contentful-paint"].numericValue);
  if (i === runs - 1) {
    const failed = Object.values(report.audits as Record<string, { id: string; score: number | null; scoreDisplayMode: string; title: string }>)
      .filter((a) => a.score !== null && a.score < 0.9 && a.scoreDisplayMode !== "informative" && a.scoreDisplayMode !== "notApplicable" && a.scoreDisplayMode !== "manual")
      .map((a) => `${a.id} (${a.score})`);
    console.log("audits below 0.9 in the last run:", failed.join(", ") || "none");
  }
}
const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
console.log(JSON.stringify({ url, formFactor, runs, median: Object.fromEntries(cats.map((c) => [c, median(scores[c])])), all: scores, lcpMs: Math.round(median(metrics.lcp)), tbtMs: Math.round(median(metrics.tbt)), cls: Number(median(metrics.cls).toFixed(3)), fcpMs: Math.round(median(metrics.fcp)) }, null, 1));
