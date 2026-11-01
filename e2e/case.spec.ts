import { expect, test, type Page } from "@playwright/test";
import { caseStudy } from "../src/data/case-study";
import { projects } from "../src/data/projects";
import { expectNoA11yViolations } from "./helpers";

// Runbook V5: the case-study template on /work/[slug], filled from the graph.

const pad = (n: number) => String(n).padStart(2, "0");
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

test.describe("Case studies: every page", () => {
  for (const [i, p] of projects.entries()) {
    test(`${p.slug}: title, position, figures in the server HTML, next project`, async ({ page, request }) => {
      const data = caseStudy(p.slug)!;
      // Facts before any script runs: each figure's final value and marker is in the export.
      const html = await (await request.get(`/work/${p.slug}`)).text();
      for (const f of data.figures) expect(html, f.value).toContain(`data-count="${f.value}">${f.value}<`);

      await page.goto(`/work/${p.slug}`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(p.title);
      await expect(page.locator("main").getByText(`work / ${pad(i + 1)} of ${pad(projects.length)}`)).toBeVisible();
      const next = projects[(i + 1) % projects.length];
      await expect(page.getByRole("navigation", { name: "Next project" }).getByRole("link", { name: new RegExp(`^${escape(next.title)}`) })).toHaveAttribute("href", `/work/${next.slug}`);
      // A section appears only when the graph has data for it.
      await expect(page.getByRole("heading", { level: 2, name: "What it did" })).toHaveCount(data.figures.length > 0 ? 1 : 0);
      await expect(page.getByRole("heading", { level: 2, name: "How it fits together" })).toHaveCount(p.diagram ? 1 : 0);
    });
  }
});

test.describe("Case studies: template parts", () => {
  test("DevHacks × Cubbie has one sub-section per entry, each with its own repository", async ({ page }) => {
    await page.goto("/work/devhacks-cubbie");
    const entries = page.getByRole("region", { name: "The entries" }).getByRole("listitem").filter({ has: page.getByRole("heading", { level: 3 }) });
    await expect(entries.getByRole("heading", { level: 3 })).toHaveText([/^Cooked\s*winner$/, "Receipts", "Bailout"]);
    await expect(entries.nth(0).getByRole("link", { name: /Cooked repository/ })).toHaveAttribute("href", "https://github.com/SrujanRudrapati/cooked");
    await expect(entries.nth(1).getByRole("link", { name: /Receipts repository/ })).toHaveAttribute("href", "https://github.com/SrujanRudrapati/receipts");
    await expect(entries.nth(2).getByRole("link")).toHaveCount(0); // Bailout has no repo (facts 2.2)
  });

  test("Label Lens shows the real screenshot instead of a 3D scene", async ({ page }) => {
    await page.goto("/work/label-lens");
    await expect(page.getByRole("img", { name: /live Label Lens home page/ })).toBeVisible();
    await expect(page.locator("main [data-scene]")).toHaveCount(0);
  });

  test("featured projects without a screenshot carry their 3D cover; compact pages have none", async ({ page }) => {
    await page.goto("/work/surplus-ai");
    await expect(page.locator('main [data-scene="surplus-line"]')).toHaveCount(1);
    await page.goto("/work/f1-race-predictor");
    await expect(page.locator("main [data-scene]")).toHaveCount(0);
    await expect(page.locator("main figure.flow")).toHaveCount(0);
  });

  test("a shared problem with no project text shows only the named problem, linked to the lens", async ({ page }) => {
    await page.goto("/work/label-lens");
    const section = page.getByRole("region", { name: "Problem it solved" });
    await expect(section.getByRole("link", { name: /Ungrounded AI output/ })).toHaveAttribute("href", "/explore#lens=problems");
    await expect(page.getByRole("heading", { level: 2, name: "The problem" })).toHaveCount(0);
  });

  test("has no accessibility violations (featured, entries, compact)", async ({ page }) => {
    for (const slug of ["surplus-ai", "devhacks-cubbie", "label-lens", "wlan-forensics-toolkit"]) {
      await page.goto(`/work/${slug}`);
      await expectNoA11yViolations(page, "main");
    }
  });
});

test.describe("Case studies: the architecture diagram is drawn by scroll", () => {
  const SVG = "main figure.flow svg:visible";
  /** Dash offset of each drawn connector in the first diagram (1 = undrawn, 0 = drawn). */
  const offsets = (page: Page) => page.locator(SVG).first().locator('[data-edge="draw"] path:first-child').evaluateAll((ps) => ps.map((p) => Number(getComputedStyle(p).strokeDashoffset.replace("px", ""))));
  /** Lit-overlay opacity for each box of the first diagram that a track reaches, with when it is reached. */
  const lit = (page: Page) => page.locator(SVG).first().locator(".flow-node[data-at]:has(.flow-lit)").evaluateAll((gs) => gs.map((g) => ({ at: Number((g as HTMLElement).dataset.at), op: Number(getComputedStyle(g.querySelector(".flow-lit")!).opacity) })));
  /** Put the first diagram's top at this fraction of the viewport height. */
  const scrollFigure = (page: Page, viewportFraction: number) => page.locator("main figure.flow").first().evaluate((el, f) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - window.innerHeight * f), viewportFraction);

  test.describe("with motion", () => {
    test.use({ reducedMotion: "no-preference" }); // the config defaults every test to reduced motion
    test("scrolling draws the connectors and lights the boxes in order", async ({ page, isMobile }) => {
      test.skip(isMobile, "Checked once, on desktop");
      await page.goto("/work/surplus-ai");
      await scrollFigure(page, 1.2); // below the fold: nothing drawn yet
      await expect.poll(async () => Math.min(...(await offsets(page)))).toBeGreaterThan(0.99);
      await scrollFigure(page, 0.55); // part way through the scroll range
      await expect.poll(async () => {
        const o = await offsets(page);
        return o.some((x) => x < 0.01) && o.some((x) => x > 0.99);
      }).toBe(true);
      // In order: every box reached before the first unlit one is already lit.
      const mid = await lit(page);
      expect(mid.length).toBeGreaterThan(0);
      const firstDark = Math.min(...mid.filter((x) => x.op < 0.5).map((x) => x.at));
      expect(mid.filter((x) => x.at < firstDark).every((x) => x.op > 0.5)).toBe(true);
      await expect.poll(() => page.locator(SVG).first().locator("[data-scrub-dot]").first().evaluate((d) => getComputedStyle(d).display)).toBe("block");
      await scrollFigure(page, -0.6); // past the end of the range: finished
      await expect.poll(async () => Math.max(...(await offsets(page)))).toBeLessThan(0.01);
      await expect.poll(async () => (await lit(page)).every((x) => x.op > 0.99)).toBe(true);
    });
  });

  test.describe("under reduced motion", () => {
    test.use({ reducedMotion: "reduce" }); // explicit: this is the alternate mode under test
    test("every diagram is fully drawn and lit from the start, with title and description", async ({ page }) => {
      await page.goto("/work/surplus-ai");
      const svgs = page.locator(SVG);
      await expect(svgs).toHaveCount(3);
      let connectors = 0; // the privacy diagram is nested rings with no connectors, so count across all three
      for (const svg of await svgs.all()) {
        await expect(svg.locator("title")).not.toBeEmpty();
        await expect(svg.locator("desc")).not.toBeEmpty();
        const lits = await svg.locator(".flow-lit").evaluateAll((rs) => rs.map((r) => getComputedStyle(r).opacity));
        expect(lits.length).toBeGreaterThan(0);
        for (const op of lits) expect(op).toBe("1");
        const edges = await svg.locator('[data-edge="draw"] path:first-child').evaluateAll((ps) => ps.map((p) => ({ dash: getComputedStyle(p).strokeDasharray, off: getComputedStyle(p).strokeDashoffset })));
        connectors += edges.length;
        for (const e of edges) {
          expect(e.dash).toBe("none"); // no scrub-ready dash state in the markup
          expect(["0px", "0"]).toContain(e.off);
        }
        for (const d of await svg.locator("[data-scrub-dot]").evaluateAll((ds) => ds.map((x) => getComputedStyle(x).display))) expect(d).toBe("none");
      }
      expect(connectors).toBeGreaterThan(0);
    });
  });
});

test.describe("Case studies: next project", () => {
  test("the poster preview appears on hover with a fine pointer", async ({ page, isMobile }) => {
    test.skip(isMobile, "Hover preview is desktop only");
    await page.goto("/work/surplus-ai"); // next is DevHacks × Cubbie, which has a poster
    const link = page.getByRole("navigation", { name: "Next project" }).getByRole("link").first();
    const poster = link.locator("img");
    await link.scrollIntoViewIfNeeded();
    await expect(poster).toHaveCSS("opacity", "0");
    await link.hover();
    await expect(poster).toHaveCSS("opacity", "1");
  });

  test("on phones the next link is one tap and has no preview", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Phone only");
    await page.goto("/work/label-lens");
    const link = page.getByRole("navigation", { name: "Next project" }).getByRole("link").first();
    await expect(link.locator("img")).toBeHidden();
    await link.tap();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Autonomous Supply Chain Watchtower");
  });
});
