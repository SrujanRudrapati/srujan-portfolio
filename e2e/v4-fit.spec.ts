import { expect, test } from "@playwright/test";
import { expectNoA11yViolations } from "./helpers";

// Runbook v4 W8 (fit and accessibility): no sideways scroll on any route at any of the eight target
// sizes, and axe clean on every route. The home and Work fits (tiles, catalogue controls) are in
// v4-home.spec.ts and v4-work.spec.ts.

const ROUTES = ["/", "/work", "/work/surplus-station", "/work/devhacks-cubbie", "/work/label-lens", "/work/supply-chain-watchtower", "/work/gesture-rc-car", "/experience", "/about", "/contact", "/explore", "/cv", "/no-such-page"];
const SIZES = [
  { width: 360, height: 780 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1280, height: 720 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];

test.describe("v4 fit", () => {
  test.beforeEach(({ isMobile }) => test.skip(isMobile, "sizes are set explicitly; one project is enough"));
  for (const size of SIZES) {
    test(`${size.width}x${size.height}: scrollWidth equals innerWidth on every route`, async ({ page }) => {
      await page.setViewportSize(size);
      for (const path of ROUTES) {
        await page.goto(path);
        await page.evaluate(() => document.fonts.ready);
        // html and body clip horizontal overflow (globals.css), which would hide a wide element from
        // scrollWidth; measure with the clip lifted so real overflow shows. Intended scrollers (the
        // timeline panel, the catalogue stage) keep their own overflow and still pass.
        await page.addStyleTag({ content: "html, body { overflow-x: visible !important; }" });
        const [scrollWidth, innerWidth] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
        expect(scrollWidth, `${path} at ${size.width}`).toBe(innerWidth);
      }
    });
  }
});

test.describe("v4 accessibility", () => {
  for (const path of ROUTES) {
    test(`${path}: no axe violations`, async ({ page }) => {
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      await expectNoA11yViolations(page);
    });
  }
});
