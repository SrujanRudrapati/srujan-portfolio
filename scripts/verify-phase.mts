// Phase evidence routine for docs/REDESIGN_RUNBOOK.md rule 9.
//
//   npm run verify -- --phase 4 [--no-build] [--tablet] [--path /] [--path "/#lens=timeline"] [--port 4321]
//
// Builds the static export (unless --no-build), serves out/ with `serve`, then for
// each path drives headless Chrome at 390px and 1280px in light and dark:
// scrolls the page so Reveal blocks fire, saves full-page screenshots to
// docs/screenshots/phase-N/, runs axe (WCAG 2.2 AA), records console errors,
// failed requests, and horizontal overflow. Writes verify.json and verify.md
// beside the screenshots and exits 1 if anything failed.
//
// Runs on Node 22 with native type stripping: no enums, no parameter properties.

import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium, type Browser, type BrowserContext, type Page } from "@playwright/test";
import axeModule from "@axe-core/playwright";

// @axe-core/playwright is CommonJS with a default export; Node's ESM interop may hand back the namespace.
const AxeBuilder = ((axeModule as unknown as { default?: unknown }).default ?? axeModule) as new (opts: {
  page: Page;
}) => { withTags(tags: string[]): { analyze(): Promise<{ violations: AxeViolation[] }> } };

type AxeViolation = {
  id: string;
  impact?: string | null;
  help: string;
  nodes: { target: unknown[] }[];
};

type Viewport = { name: "mobile" | "tablet" | "desktop"; width: number; height: number };
type Theme = "light" | "dark";

type Run = {
  path: string;
  viewport: Viewport["name"];
  theme: Theme;
  screenshot: string;
  foldScreenshot?: string;
  consoleErrors: string[];
  failedRequests: string[];
  horizontalOverflowPx: number;
  axeViolations: { id: string; impact: string; help: string; targets: string[] }[];
  passed: boolean;
};

const VIEWPORTS: Viewport[] = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1280, height: 800 },
];
const TABLET: Viewport = { name: "tablet", width: 768, height: 1024 };
const THEMES: Theme[] = ["light", "dark"];
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const SERVER_START_TIMEOUT_MS = 20_000;
const REVEAL_SETTLE_MS = 800;

type Args = { phase: string; build: boolean; paths: string[]; port: number; tablet: boolean };

function parseArgs(argv: string[]): Args {
  const args: Args = { phase: "", build: true, paths: [], port: 4321, tablet: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--phase") args.phase = argv[++i] ?? "";
    else if (arg === "--no-build") args.build = false;
    else if (arg === "--tablet") args.tablet = true;
    else if (arg === "--path") args.paths = [...args.paths, argv[++i] ?? "/"];
    else if (arg === "--port") args.port = Number(argv[++i] ?? "4321");
    else if (arg.startsWith("--phase=")) args.phase = arg.slice("--phase=".length);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!args.phase) throw new Error("Missing --phase N (e.g. --phase 4, --phase S)");
  if (args.paths.length === 0) args.paths = ["/"];
  return args;
}

function slugForPath(path: string): string {
  const slug = path.replace(/^\//, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase();
  return slug === "" ? "home" : `home-${slug}`;
}

function build(): void {
  console.log("▸ npm run build");
  const result = spawnSync("npm", ["run", "build"], { stdio: "inherit" });
  if (result.status !== 0) throw new Error("Build failed");
}

async function waitForServer(url: string): Promise<void> {
  const deadline = Date.now() + SERVER_START_TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Not up yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Server did not answer at ${url} within ${SERVER_START_TIMEOUT_MS}ms`);
}

function startServer(port: number): ChildProcess {
  console.log(`▸ serve out on :${port}`);
  return spawn("npx", ["serve", "out", "-l", String(port), "--no-clipboard"], { stdio: "ignore" });
}

async function scrollThrough(page: Page): Promise<void> {
  await page.evaluate(async () => {
    // The site scrolls smoothly; stepping with smooth scrolling never settles
    // on each position, so IntersectionObserver callbacks never see the blocks.
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    const step = Math.max(200, Math.floor(window.innerHeight * 0.6));
    for (let y = 0; y < root.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
    window.scrollTo(0, root.scrollHeight);
    await new Promise((resolve) => setTimeout(resolve, 120));
    window.scrollTo(0, 0);
    root.style.scrollBehavior = previous;
  });
  await page.waitForTimeout(REVEAL_SETTLE_MS);
}

async function runOne(
  browser: Browser,
  baseUrl: string,
  outDir: string,
  path: string,
  viewport: Viewport,
  theme: Theme,
): Promise<Run> {
  const context: BrowserContext = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    colorScheme: theme,
    deviceScaleFactor: 1,
    isMobile: viewport.name === "mobile",
    hasTouch: viewport.name === "mobile",
  });
  const page = await context.newPage();
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") consoleErrors.push(`${message.type()}: ${message.text()}`);
  });
  page.on("pageerror", (error) => consoleErrors.push(`pageerror: ${error.message}`));
  page.on("requestfailed", (request) => failedRequests.push(`${request.url()} (${request.failure()?.errorText ?? "failed"})`));
  page.on("response", (response) => {
    if (response.status() >= 400) failedRequests.push(`${response.url()} (${response.status()})`);
  });

  await page.goto(`${baseUrl}${path}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await scrollThrough(page);

  const stem = `${slugForPath(path)}-${viewport.name}-${theme}`;
  const screenshot = `${stem}.png`;
  let foldScreenshot: string | undefined;
  if (viewport.name === "mobile") {
    foldScreenshot = `${stem}-fold.png`;
    await page.screenshot({ path: join(outDir, foldScreenshot), fullPage: false, animations: "disabled" });
  }
  await page.screenshot({ path: join(outDir, screenshot), fullPage: true, animations: "disabled" });

  const horizontalOverflowPx = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  const axeViolations = violations.map((v) => ({
    id: v.id,
    impact: v.impact ?? "unknown",
    help: v.help,
    targets: v.nodes.map((n) => n.target.map(String).join(" ")),
  }));

  await context.close();
  const passed = consoleErrors.length === 0 && failedRequests.length === 0 && horizontalOverflowPx <= 0 && axeViolations.length === 0;
  return { path, viewport: viewport.name, theme, screenshot, foldScreenshot, consoleErrors, failedRequests, horizontalOverflowPx, axeViolations, passed };
}

function toMarkdown(phase: string, runs: Run[]): string {
  const rows = runs.map((r) => {
    const status = r.passed ? "pass" : "FAIL";
    const issues = [
      ...r.consoleErrors.map((e) => `console: ${e}`),
      ...r.failedRequests.map((f) => `request: ${f}`),
      ...(r.horizontalOverflowPx > 0 ? [`overflow: ${r.horizontalOverflowPx}px`] : []),
      ...r.axeViolations.map((v) => `axe ${v.id} (${v.impact}): ${v.targets.join(", ")}`),
    ];
    return `| \`${r.path}\` | ${r.viewport} | ${r.theme} | ${status} | ${r.screenshot} | ${issues.join("<br>") || "none"} |`;
  });
  const summary = runs.every((r) => r.passed) ? "All checks passed." : `${runs.filter((r) => !r.passed).length} of ${runs.length} runs failed.`;
  return [
    `# Phase ${phase} verification`,
    "",
    `Generated ${new Date().toISOString()} by \`npm run verify -- --phase ${phase}\`. ${summary}`,
    "",
    "| Path | Viewport | Theme | Result | Screenshot | Issues |",
    "|---|---|---|---|---|---|",
    ...rows,
    "",
  ].join("\n");
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const outDir = join(process.cwd(), "docs", "screenshots", `phase-${args.phase}`);
  mkdirSync(outDir, { recursive: true });
  if (args.build) build();

  const server = startServer(args.port);
  const baseUrl = `http://localhost:${args.port}`;
  let browser: Browser | undefined;
  try {
    await waitForServer(`${baseUrl}/`);
    browser = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());
    const runs: Run[] = [];
    const viewports = args.tablet ? [VIEWPORTS[0], TABLET, VIEWPORTS[1]] : VIEWPORTS;
    for (const path of args.paths) {
      for (const viewport of viewports) {
        for (const theme of THEMES) {
          console.log(`▸ ${path} ${viewport.name} ${theme}`);
          runs.push(await runOne(browser, baseUrl, outDir, path, viewport, theme));
        }
      }
    }
    const markdown = toMarkdown(args.phase, runs);
    writeFileSync(join(outDir, "verify.json"), JSON.stringify({ phase: args.phase, generatedAt: new Date().toISOString(), runs }, null, 2));
    writeFileSync(join(outDir, "verify.md"), markdown);
    console.log(`\n${markdown}`);
    console.log(`Screenshots and reports: ${outDir}`);
    if (!runs.every((r) => r.passed)) process.exitCode = 1;
  } finally {
    await browser?.close();
    server.kill();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
