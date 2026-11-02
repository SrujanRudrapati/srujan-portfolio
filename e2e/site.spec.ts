import { expect, test } from "@playwright/test";
import { expectNoA11yViolations } from "./helpers";

// Routes, the shell on every page, the command palette, and that older anchors still land
// (docs/v4/IA.md). Updated for v4 in W7: the header is the name, the footer the Arizona clock.

const PAGES = [
  { path: "/work", h1: "Work" },
  { path: "/experience", h1: "Experience" },
  { path: "/about", h1: "About" },
  { path: "/contact", h1: "Contact" },
  { path: "/explore", h1: "Explore" },
  { path: "/cv", h1: "CV" },
  { path: "/work/label-lens", h1: "Label Lens" },
];

test.describe("Routes", () => {
  for (const p of PAGES) {
    test(`${p.path} has one h1, the header, the back pill, the footer, and no accessibility violations`, async ({ page }) => {
      await page.goto(p.path);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(p.h1);
      await expect(page.getByRole("banner").getByRole("link", { name: "Srujan Rudrapati" })).toBeVisible();
      await expect(page.locator("main a.back")).toHaveCount(1);
      await expect(page.getByRole("contentinfo")).toContainText("Arizona");
      await expectNoA11yViolations(page, "main");
    });
  }

  test("every project has its own page, all listed on /work", async ({ page }) => {
    await page.goto("/work");
    // v4: the List layout shows all eleven.
    await expect(async () => {
      await page.getByRole("button", { name: "List" }).click();
      await expect(page.locator("[data-work-list] a")).toHaveCount(11, { timeout: 1000 });
    }).toPass({ timeout: 10000 });
    const hrefs = await page.locator("[data-work-list] a").evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute("href")))]);
    expect(hrefs).toHaveLength(11);
    for (const href of hrefs) {
      const res = await page.request.get(href!);
      expect(res.status(), href!).toBe(200);
    }
  });

  test("older anchors land on /about, the roles are on /experience, the one-pager on /cv", async ({ page }) => {
    await page.goto("/about");
    for (const id of ["skills", "credentials"]) await expect(page.locator(`#${id}`)).toBeVisible();
    await page.goto("/experience");
    await expect(page.locator("[data-item^='role-']")).toHaveCount(4);
    await page.goto("/cv");
    await expect(page.locator("#recruiter-sheet")).toContainText("rudrapati.srujan@gmail.com");
  });

  test("an unknown path shows the 404 with links to every page", async ({ page }) => {
    const res = await page.goto("/no-such-page");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Row not found");
    const pages = page.locator("main ul").first();
    for (const name of ["Home", "Work", "Experience", "About", "Contact", "Explore", "CV"]) await expect(pages.getByRole("link", { name, exact: true })).toBeVisible();
  });
});

test.describe("Keyboard", () => {
  test.beforeEach(({ isMobile }) => test.skip(isMobile, "Keyboard shortcuts are a desktop path"));

  test("⌘K opens the palette; typing filters; Enter opens a project; Escape returns focus", async ({ page }) => {
    await page.goto("/about", { waitUntil: "networkidle" });
    const opener = page.locator("main a.back");
    await opener.focus();
    await page.keyboard.press("ControlOrMeta+k");
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
    await page.goto("/", { waitUntil: "networkidle" });
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
