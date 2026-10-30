import { expect, test } from "@playwright/test";
import { expectNoA11yViolations } from "./helpers";

// Runbook V3: routes, the nav, number keys, the command palette, and that every v2
// section still exists somewhere (docs/v3/IA.md).

const PAGES = [
  { path: "/work", h1: "Work" },
  { path: "/explore", h1: "Explore" },
  { path: "/about", h1: "About" },
  { path: "/cv", h1: "CV" },
  { path: "/work/label-lens", h1: "Label Lens" },
];

test.describe("Routes", () => {
  for (const p of PAGES) {
    test(`${p.path} has one h1, the nav, the footer, and no accessibility violations`, async ({ page }) => {
      await page.goto(p.path);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(p.h1);
      await expect(page.getByRole("banner").getByRole("link", { name: "Resume" })).toBeVisible();
      await expect(page.getByRole("contentinfo").getByRole("link", { name: "rudrapati.srujan@gmail.com" })).toBeVisible();
      await expectNoA11yViolations(page, "main");
    });
  }

  test("every project has its own page, all listed on /work", async ({ page }) => {
    await page.goto("/work");
    await expect(page.locator("main").getByRole("article")).toHaveCount(11);
    const hrefs = await page.locator('main a[href^="/work/"]').evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute("href")))]);
    expect(hrefs).toHaveLength(11);
    for (const href of hrefs) {
      const res = await page.request.get(href!);
      expect(res.status(), href!).toBe(200);
    }
  });

  test("the v2 sections live on /about and /cv", async ({ page }) => {
    await page.goto("/about");
    for (const id of ["about", "experience", "skills", "credentials"]) await expect(page.locator(`#${id}`)).toBeVisible();
    await expect(page.locator("#experience").getByRole("heading", { level: 3 })).toHaveCount(4);
    await page.goto("/cv");
    await expect(page.locator("#recruiter-sheet")).toContainText("rudrapati.srujan@gmail.com");
  });

  test("an unknown path shows the 404 with links to every page", async ({ page }) => {
    const res = await page.goto("/no-such-page");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Row not found");
    for (const name of ["Home", "Work", "Explore", "About", "CV"]) await expect(page.locator("main").getByRole("link", { name, exact: true })).toBeVisible();
  });
});

test("the palette is the phone menu: opens from the bar, Escape closes and returns focus, no axe violations", async ({ page }) => {
  await page.goto("/about");
  const opener = page.getByRole("banner").getByRole("button", { name: /Menu|Search/ });
  await opener.click();
  const palette = page.getByRole("dialog", { name: "Command palette" });
  await expect(palette.getByRole("combobox")).toBeFocused();
  await expectNoA11yViolations(page, "dialog[open]");
  await palette.getByRole("option", { name: "Work 1", exact: true }).click(); // the label and its number key
  await expect(page).toHaveURL(/\/work$/);
  await opener.click();
  await page.keyboard.press("Escape");
  await expect(palette).toBeHidden();
  await expect(opener).toBeFocused();
});

test.describe("Keyboard", () => {
  test.beforeEach(({ isMobile }) => test.skip(isMobile, "Keyboard shortcuts are a desktop path"));

  test("number keys 1 to 4 open the main pages, but not while typing", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("3");
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("About");
    await page.keyboard.press("1");
    await expect(page).toHaveURL(/\/work$/);
    await page.goto("/");
    await page.locator("#hero-ask").fill("2");
    await page.locator("#hero-ask").press("4");
    await expect(page).toHaveURL(/\/$/);
  });

  test("⌘K opens the palette; typing filters; Enter opens a project; Escape returns focus", async ({ page }) => {
    await page.goto("/about");
    const opener = page.getByRole("banner").getByRole("button", { name: /Search/ });
    await opener.click();
    const palette = page.getByRole("dialog", { name: "Command palette" });
    await expect(palette).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(palette).toBeHidden();
    await expect(opener).toBeFocused();

    await page.keyboard.press("ControlOrMeta+k");
    await expect(palette.getByRole("combobox")).toBeFocused();
    await page.keyboard.type("watchtower");
    await expect(palette.getByRole("option", { selected: true })).toContainText("Autonomous Supply Chain Watchtower");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/work\/supply-chain-watchtower$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  });

  test("the palette is a labelled combobox whose active option is announced", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("ControlOrMeta+k");
    const box = page.getByRole("dialog", { name: "Command palette" }).getByRole("combobox");
    const first = await box.getAttribute("aria-activedescendant");
    await page.keyboard.press("ArrowDown");
    const second = await box.getAttribute("aria-activedescendant");
    expect(first).toBeTruthy();
    expect(second).not.toBe(first);
    await expect(page.locator(`[id="${second}"]`)).toHaveAttribute("aria-selected", "true");
    await expectNoA11yViolations(page, "dialog[open]");
  });
});
