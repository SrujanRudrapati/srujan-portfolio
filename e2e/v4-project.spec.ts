import { expect, test, type Page } from "@playwright/test";
import { projectPage } from "../src/data/project-page";
import { projects } from "../src/data/projects";
import { FEATURED_ORDER } from "../src/data/work";
import { expectNoA11yViolations } from "./helpers";

// Runbook v4 W4: project pages on /work/[slug], filled from the graph.
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const main = (page: Page) => page.locator("main");

test.describe("v4 project pages: every page", () => {
  for (const p of projects) {
    test(`${p.slug}: title, back pill, results, sections, next project`, async ({ page, request }) => {
      const data = projectPage(p.slug)!;
      // Facts are in the export before any script runs.
      const html = await (await request.get(`/work/${p.slug}`)).text();
      for (const f of data.figures.slice(0, 3)) expect(html, f.value).toContain(`>${f.value}<`);

      await page.goto(`/work/${p.slug}`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(p.title);
      await expect(main(page).getByRole("link", { name: "All work" })).toHaveAttribute("href", /\/work\/?$/);
      await expect(main(page).getByText(p.oneLiner, { exact: true })).toBeVisible();
      await expect(main(page).locator("[data-result]")).toHaveCount(Math.min(3, data.figures.length));
      // The band (art plate) is for the v4 catalogue's four only, until the v5 project pages replace this template.
      const plated = (FEATURED_ORDER as readonly string[]).includes(p.slug);
      await expect(main(page).locator("header [data-art]")).toHaveCount(plated ? 1 : 0);
      // A section appears only when the graph has data for it.
      const hasDiagram = Boolean(p.diagram);
      await expect(page.getByRole("heading", { level: 2, name: "How it’s built" })).toHaveCount(hasDiagram ? 1 : 0);
      await expect(page.getByRole("heading", { level: 2, name: "Stack" })).toHaveCount(p.stack.length > 0 || p.statusNotes || p.statusDetail || p.credit ? 1 : 0);
      const next = page.getByRole("navigation", { name: "Next project" }).getByRole("link");
      await expect(next).toHaveAttribute("href", new RegExp(`/work/${data.nextInGroup.slug}/?$`));
      await expect(next).toContainText(new RegExp(escape(data.nextInGroup.name)));
    });
  }
});

test.describe("v4 project pages: template parts", () => {
  test("the featured four loop: Watchtower leads back to Surplus Station", async ({ page }) => {
    await page.goto("/work/supply-chain-watchtower");
    await page.getByRole("navigation", { name: "Next project" }).getByRole("link").click();
    await expect(page).toHaveURL(/\/work\/surplus-station\/?$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Surplus Station");
  });

  test("DevHacks × Cubbie keeps one sub-section per entry, each with its own repository", async ({ page }) => {
    await page.goto("/work/devhacks-cubbie");
    const entries = page.getByRole("region", { name: "The entries" }).getByRole("listitem").filter({ has: page.getByRole("heading", { level: 3 }) });
    await expect(entries.getByRole("heading", { level: 3 })).toHaveText([/^Cooked\s*winner$/, "Receipts", "Bailout"]);
    await expect(entries.nth(0).getByRole("link", { name: /Cooked repository/ })).toHaveAttribute("href", "https://github.com/SrujanRudrapati/cooked");
    await expect(entries.nth(1).getByRole("link", { name: /Receipts repository/ })).toHaveAttribute("href", "https://github.com/SrujanRudrapati/receipts");
    await expect(entries.nth(2).getByRole("link")).toHaveCount(0); // Bailout has no repo (facts 2.2)
  });

  test("Label Lens shows the real screenshot and links the live app", async ({ page }) => {
    await page.goto("/work/label-lens");
    await expect(page.getByRole("img", { name: /live Label Lens home page/ })).toBeVisible();
    await expect(main(page).getByRole("link", { name: /Live app/ })).toHaveAttribute("href", "https://label-lens-iota.vercel.app");
  });

  test("Surplus Station shows all three architecture diagrams, static under reduced motion", async ({ page }) => {
    await page.goto("/work/surplus-station");
    const figures = main(page).locator("figure.flow");
    await expect(figures).toHaveCount(3);
    await expect(figures.first()).not.toHaveAttribute("data-draw", /.*/);
    const lit = await figures.first().locator("svg:visible .flow-lit").evaluateAll((rs) => rs.map((r) => getComputedStyle(r).opacity));
    expect(lit.length).toBeGreaterThan(0);
    expect(new Set(lit)).toEqual(new Set(["1"]));
  });

  for (const slug of ["surplus-station", "devhacks-cubbie", "label-lens", "f1-race-predictor"]) {
    test(`${slug}: no accessibility violations`, async ({ page }) => {
      await page.goto(`/work/${slug}`);
      await expectNoA11yViolations(page);
    });
  }
});

test.describe("v4 project pages without JavaScript", () => {
  test.use({ javaScriptEnabled: false, reducedMotion: "no-preference" });
  test("the diagram is the finished drawing, every box lit", async ({ page }) => {
    await page.goto("/work/supply-chain-watchtower");
    const figure = main(page).locator("figure.flow").first();
    await expect(figure).not.toHaveAttribute("data-draw", /.*/);
    const lit = await figure.locator("svg:visible .flow-lit").evaluateAll((rs) => rs.map((r) => getComputedStyle(r).opacity));
    expect(lit.length).toBeGreaterThan(0);
    expect(new Set(lit)).toEqual(new Set(["1"]));
  });
});

test.describe("v4 project pages with motion", () => {
  test.use({ reducedMotion: "no-preference" });

  test("a diagram below the fold waits, then draws once it scrolls into view", async ({ page }) => {
    await page.goto("/work/supply-chain-watchtower");
    const figure = main(page).locator("figure.flow").first();
    await expect(figure).toHaveAttribute("data-draw", "ready");
    const unlit = await figure.locator("svg:visible .flow-node[data-at] .flow-lit").first().evaluate((r) => getComputedStyle(r).opacity);
    expect(unlit).toBe("0");
    await figure.scrollIntoViewIfNeeded();
    await expect(figure).toHaveAttribute("data-draw", "on");
    // Every box is lit once the 1.8 s draw has run.
    await expect
      .poll(() => figure.locator("svg:visible .flow-lit").evaluateAll((rs) => rs.every((r) => getComputedStyle(r).opacity === "1")), { timeout: 5000 })
      .toBe(true);
  });
});
