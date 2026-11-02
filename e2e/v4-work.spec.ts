import { expect, test, type Page } from "@playwright/test";
import { FEATURED_ORDER, workItems } from "../src/data/work";
import { expectNoA11yViolations } from "./helpers";

// Runbook v4 W3: Work, catalogue and list.
const items = workItems();
const featured = items.filter((p) => p.featured);

async function openWork(page: Page) {
  await page.goto("/work");
  // Hydrated once the segmented highlight has been measured.
  await expect.poll(() => page.locator("[role='group'][aria-label='Layout']").evaluate((el) => (el as HTMLElement).style.getPropertyValue("--sw"))).not.toBe("");
}
const front = (page: Page) => page.locator("[data-stage] a[data-front]");
const count = (page: Page) => page.locator("[data-catalogue-count]");

test.describe("v4 work catalogue", () => {
  test("shows the four featured projects in order, one at a time, and loops both ways", async ({ page }) => {
    await openWork(page);
    await expect(page.locator("[data-stage] a")).toHaveCount(4);
    await expect(count(page)).toHaveText("1 of 4");
    await expect(front(page)).toHaveAttribute("href", /\/work\/surplus-ai\/?$/);
    const next = page.getByRole("button", { name: "Next project" });
    for (let i = 1; i < FEATURED_ORDER.length; i++) {
      await next.click();
      await expect(front(page)).toHaveAttribute("href", new RegExp(`/work/${FEATURED_ORDER[i]}/?$`));
    }
    await next.click(); // after the last comes the first
    await expect(count(page)).toHaveText("1 of 4");
    await page.getByRole("button", { name: "Previous project" }).click(); // and before the first, the last
    await expect(count(page)).toHaveText("4 of 4");
  });

  test("arrow keys move the focused stage; only the front card is focusable", async ({ page }) => {
    await openWork(page);
    const stage = page.locator("[data-stage]");
    await stage.focus();
    await page.keyboard.press("ArrowRight");
    await expect(count(page)).toHaveText("2 of 4");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await expect(count(page)).toHaveText("4 of 4");
    await expect(page.locator("[data-stage] a:not([inert])")).toHaveCount(1);
    // With the front card focused, the arrows still move it, and focus stays on the stage.
    await front(page).focus();
    await page.keyboard.press("ArrowRight");
    await expect(count(page)).toHaveText("1 of 4");
    await expect(stage).toBeFocused();
  });

  test("pills jump to a project and mark the current one", async ({ page, isMobile }) => {
    test.skip(isMobile, "pills are hidden on phones");
    await openWork(page);
    await page.getByRole("button", { name: `Show ${featured[2].name}` }).click();
    await expect(count(page)).toHaveText("3 of 4");
    await expect(page.getByRole("button", { name: `Show ${featured[2].name}` })).toHaveAttribute("aria-current", "true");
  });

  test("a drag past 20% of the card moves one card; a short slow drag does not", async ({ page, isMobile }) => {
    test.skip(isMobile, "mouse drag");
    await openWork(page);
    const box = await page.locator("[data-stage]").boundingBox();
    if (!box) throw new Error("no stage");
    const y = box.y + box.height / 2;
    await page.mouse.move(box.x + box.width * 0.7, y);
    await page.mouse.down();
    for (let x = 10; x <= 40; x += 10) {
      await page.mouse.move(box.x + box.width * 0.7 - x, y);
      await page.waitForTimeout(40); // slow: not a flick
    }
    await page.waitForTimeout(150);
    await page.mouse.up();
    await expect(count(page)).toHaveText("1 of 4");
    await page.mouse.move(box.x + box.width * 0.7, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.3, y, { steps: 8 });
    await page.mouse.up();
    await expect(count(page)).toHaveText("2 of 4");
    await expect(page).toHaveURL(/\/work\/?$/); // the drag did not open the card
  });

  test("a horizontal wheel gesture moves one card", async ({ page, isMobile }) => {
    test.skip(isMobile, "wheel");
    await openWork(page);
    const box = await page.locator("[data-stage]").boundingBox();
    if (!box) throw new Error("no stage");
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(80, 0);
    await expect(count(page)).toHaveText("2 of 4");
  });

  test("clicking the front card opens its project", async ({ page }) => {
    await openWork(page);
    await front(page).click();
    await expect(page).toHaveURL(/\/work\/surplus-ai\/?$/);
  });

  test("no accessibility violations", async ({ page }) => {
    await openWork(page);
    await expectNoA11yViolations(page);
  });
});

test.describe("v4 work list", () => {
  test("the toggle switches to rounded rows: the four featured first, then the other seven", async ({ page }) => {
    await openWork(page);
    const list = page.getByRole("button", { name: "List" });
    await list.click();
    await expect(list).toHaveAttribute("aria-pressed", "true");
    const rows = page.locator("[data-work-list] a");
    await expect(rows).toHaveCount(items.length);
    for (const [i, p] of items.entries()) {
      await expect(rows.nth(i)).toHaveAttribute("href", new RegExp(`/work/${p.slug}/?$`));
      await expect(rows.nth(i)).toContainText(p.name);
    }
    await expect(page.locator("[data-stage]")).toHaveCount(0);
    await page.getByRole("button", { name: "Catalogue" }).click();
    await expect(page.locator("[data-stage]")).toHaveCount(1);
  });

  test("no accessibility violations", async ({ page }) => {
    await openWork(page);
    await page.getByRole("button", { name: "List" }).click();
    await expectNoA11yViolations(page);
  });
});

test.describe("v4 work with motion", () => {
  test.use({ reducedMotion: "no-preference" });
  test("the toggle morphs with a view transition and the root stays still", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "View Transitions API");
    await openWork(page);
    await page.getByRole("button", { name: "List" }).click();
    await expect(page.locator("html")).toHaveClass(/vt-toggle/);
    await expect(page.locator("html")).not.toHaveClass(/vt-toggle/, { timeout: 3000 });
    await expect(page.locator("[data-work-list] a")).toHaveCount(items.length);
  });
});

test.describe("v4 work fits the screen", () => {
  for (const vp of [
    { width: 1280, height: 720 },
    { width: 1366, height: 768 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
  ]) {
    test(`${vp.width}x${vp.height}: the stage and its controls are on screen`, async ({ page, isMobile }) => {
      test.skip(isMobile, "desktop sizes");
      await page.setViewportSize(vp);
      await openWork(page);
      const bottom = await page.getByRole("button", { name: "Next project" }).evaluate((el) => el.getBoundingClientRect().bottom);
      expect(bottom).toBeLessThanOrEqual(vp.height);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
    });
  }
});
