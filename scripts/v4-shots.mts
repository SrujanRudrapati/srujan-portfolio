// Runbook v4 W0.2 / G5 / W8: screenshots of every view at the four target viewports,
// either of the approved reference HTML or of the built site, so they can be compared side by side.
// Usage:
//   node --experimental-strip-types scripts/v4-shots.mts reference [outDir]
//   node --experimental-strip-types scripts/v4-shots.mts site [outDir] [baseUrl]
// Output: <outDir>/<viewport>/<view>.jpg, e.g. docs/v4/reference-shots/1280x720/home-hover-work.jpg
// Views: home-idle, home-hover-<tile>, work-catalogue, work-morph (mid-switch to the list), work-list,
// project, experience, about, contact.
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium, type Page } from "@playwright/test";

type Target = "reference" | "site";
const target = (process.argv[2] ?? "reference") as Target;
const OUT = process.argv[3] ?? (target === "reference" ? "docs/v4/reference-shots" : "docs/v4/site-shots");
const BASE = process.argv[4] ?? "http://localhost:4321";
const REFERENCE = pathToFileURL(resolve("docs/v4/reference/srujan-premium-concept.html")).href;

const ALL_VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 1280, height: 720 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];
// SHOTS_VIEWPORTS=390,1280,1440 limits the run (G5 needs three of the four).
const only = process.env.SHOTS_VIEWPORTS?.split(",").map(Number);
const VIEWPORTS = only ? ALL_VIEWPORTS.filter((v) => only.includes(v.width)) : ALL_VIEWPORTS;
const TILES = ["work", "experience", "about", "contact"] as const;

/** Where each view lives and how to reach its states, per target. */
const ROUTES: Record<Target, Record<string, string>> = {
  reference: { home: "#", work: "#work", project: "#surplus-station", experience: "#experience", about: "#about", contact: "#contact" },
  site: { home: "/", work: "/work", project: "/work/surplus-station", experience: "/experience", about: "/about", contact: "/contact" },
};
const TILE_SELECTOR: Record<Target, (k: string) => string> = {
  reference: (k) => `.hub a[href="#${k}"]`,
  site: (k) => `[data-tile="${k}"]`,
};
const LIST_TOGGLE: Record<Target, string> = { reference: "#m-list", site: "[data-layout='list']" };

const SETTLE_MS = 1600; // longer than the slowest entrance (1.2 s headline) plus the dot spring
const MORPH_MID_MS = 380; // about halfway through the 800 ms catalogue-to-list morph

const browser = await chromium.launch();
const errors: string[] = [];

async function open(page: Page, view: string) {
  const route = ROUTES[target][view];
  const url = target === "reference" ? `${REFERENCE}${route}` : `${BASE}${route}`;
  await page.goto(url, { waitUntil: "load" });
  await page.waitForTimeout(SETTLE_MS);
  await page.mouse.move(2, 2); // park the pointer away from any tile
}

async function shoot(page: Page, dir: string, name: string) {
  await page.screenshot({ path: `${dir}/${name}.jpg`, type: "jpeg", quality: 78 });
}

for (const vp of VIEWPORTS) {
  const dir = `${OUT}/${vp.width}x${vp.height}`;
  mkdirSync(dir, { recursive: true });
  const page = await browser.newPage({ viewport: vp, deviceScaleFactor: 1, colorScheme: "dark", hasTouch: vp.width < 700 });
  page.on("pageerror", (e) => errors.push(`${vp.width} ${e.message}`));

  await open(page, "home");
  await shoot(page, dir, "home-idle");
  for (const k of TILES) {
    const tile = page.locator(TILE_SELECTOR[target](k));
    await tile.scrollIntoViewIfNeeded();
    const box = await tile.boundingBox();
    if (box) await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.4);
    else await tile.focus();
    await page.waitForTimeout(SETTLE_MS);
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(200);
    await shoot(page, dir, `home-hover-${k}`);
    await page.mouse.move(2, 2);
  }

  await open(page, "work");
  await shoot(page, dir, "work-catalogue");
  await page.locator(LIST_TOGGLE[target]).click();
  await page.waitForTimeout(MORPH_MID_MS);
  await shoot(page, dir, "work-morph");
  await page.waitForTimeout(SETTLE_MS);
  await shoot(page, dir, "work-list");

  for (const view of ["project", "experience", "about", "contact"]) {
    await open(page, view);
    await shoot(page, dir, view);
  }
  await page.close();
}
await browser.close();
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
}
console.log(`shots written to ${OUT}`);
