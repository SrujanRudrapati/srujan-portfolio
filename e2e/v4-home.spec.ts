import { expect, test } from "@playwright/test";
import { homeContent } from "../src/data/home";
import { expectNoA11yViolations, openHome } from "./helpers";

// Runbook v4 W2: the home is a hub.
const content = homeContent();
const DESKTOP_FITS = [
  { width: 1280, height: 720 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];

test.describe("v4 home", () => {
  test("headline, lede, now line, Ask and four tiles, from the data", async ({ page }) => {
    await openHome(page);
    await expect(page.locator("main h1")).toHaveAccessibleName(content.headlineText);
    await expect(page.locator("main")).toContainText(content.lede.lead);
    await expect(page.locator("main")).toContainText("about 10 million records a day");
    await expect(page.locator("main")).toContainText(content.now);
    const tiles = page.locator("[data-tile]");
    await expect(tiles).toHaveCount(4);
    for (const t of content.tiles) {
      const tile = page.locator(`[data-tile="${t.key}"]`);
      await expect(tile).toContainText(t.name);
      await expect(tile).toContainText(t.hint);
      await expect(tile).toContainText(t.description);
      await expect(tile).toHaveAttribute("href", new RegExp(`${t.href}/?$`));
    }
    await expect(page.locator('[data-tile="work"]')).toContainText("4 featured, 7 more");
  });

  test("Ask about my work opens the Ask panel", async ({ page }) => {
    await openHome(page);
    await page.getByRole("button", { name: "Ask about my work" }).click();
    await expect(page.getByRole("dialog", { name: /ask/i })).toBeVisible();
  });

  test("tile hover and focus reshape the dot field; leaving returns to idle", async ({ page, isMobile }) => {
    await openHome(page);
    const shape = () => page.locator("[data-dot-field]").getAttribute("data-shape");
    if (!isMobile) {
      await page.locator('[data-tile="experience"]').hover();
      await expect.poll(shape).toBe("experience");
      await page.mouse.move(5, 5);
      await expect.poll(shape).toBe("idle");
    }
    await page.locator('[data-tile="contact"]').focus();
    await expect.poll(shape).toBe("contact");
  });

  test("no horizontal overflow, and no accessibility violations", async ({ page }) => {
    await openHome(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
    await expectNoA11yViolations(page);
  });
});

test.describe("v4 home fits one screen on desktops", () => {
  for (const vp of DESKTOP_FITS) {
    test(`${vp.width}x${vp.height}: headline, lede, now line, dots and all four tiles`, async ({ page, isMobile }) => {
      test.skip(isMobile, "desktop sizes");
      await page.setViewportSize(vp);
      await openHome(page);
      const bottoms = await page.evaluate(() =>
        [...document.querySelectorAll("main h1, main p, [data-tile], [data-dot-field]")].map((el) => el.getBoundingClientRect().bottom),
      );
      for (const b of bottoms) expect(b).toBeLessThanOrEqual(vp.height);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
      // Every headline line stays on one line: each line's box is under 1.5 font sizes tall.
      const ratios = await page.locator("main h1 [aria-hidden] > span").evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).fontSize)));
      expect(ratios).toHaveLength(3);
      for (const r of ratios) expect(r).toBeLessThan(1.5);
    });
  }
});

test.describe("v4 home on phones", () => {
  test("tiles are a 2×2 grid and the dots sit above the headline", async ({ page, isMobile }) => {
    test.skip(!isMobile, "phones");
    await openHome(page);
    const boxes = await page.locator("[data-tile]").evaluateAll((els) => els.map((e) => e.getBoundingClientRect()).map((r) => ({ x: Math.round(r.x), y: Math.round(r.y) })));
    expect(boxes[0].y).toBe(boxes[1].y);
    expect(boxes[2].y).toBe(boxes[3].y);
    expect(boxes[2].y).toBeGreaterThan(boxes[0].y);
    const dots = await page.locator("[data-dot-field]").boundingBox();
    const h1 = await page.locator("main h1").boundingBox();
    expect(dots && h1 && dots.y < h1.y).toBe(true);
  });
});
