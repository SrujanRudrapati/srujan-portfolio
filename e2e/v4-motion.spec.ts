import { expect, test, type Page } from "@playwright/test";
import { askFromHome, openHome } from "./helpers";

// Runbook v4 W8: behaviour with motion on (every other spec runs under reduced motion). Lenis must
// not steal the wheel inside a dialog; the dot field must stop drawing on a hidden tab and after
// the home page unmounts; magnetic buttons move and spring back.

test.use({ reducedMotion: "no-preference" });
test.beforeEach(({ isMobile }) => test.skip(isMobile, "wheel and fine pointer"));

/** Counts dot-field frames: each drawn frame starts with clearRect on the field's canvas. */
async function countDotFrames(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __dotFrames: number };
    w.__dotFrames = 0;
    const clear = CanvasRenderingContext2D.prototype.clearRect;
    CanvasRenderingContext2D.prototype.clearRect = function (...args: [number, number, number, number]) {
      if (this.canvas.hasAttribute("data-dot-field")) w.__dotFrames++;
      return clear.apply(this, args);
    };
  });
}
const dotFrames = (page: Page) => page.evaluate(() => (window as unknown as { __dotFrames: number }).__dotFrames);
const framesOver = async (page: Page, ms: number) => {
  const a = await dotFrames(page);
  await page.waitForTimeout(ms);
  return (await dotFrames(page)) - a;
};

test("the wheel scrolls a long Ask answer, not the page behind the dialog", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await openHome(page);
  await askFromHome(page, "What have you done with Spark?");
  const dialog = page.getByRole("dialog", { name: "Ask about my work" });
  await expect(dialog.getByRole("list", { name: "Evidence" })).toBeVisible();
  const scroller = dialog.locator("[data-lenis-prevent]");
  expect(await scroller.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
  const box = (await scroller.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  const pageY = await page.evaluate(() => scrollY);
  for (let i = 0; i < 5; i++) await page.mouse.wheel(0, 200);
  await expect.poll(() => scroller.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  expect(await page.evaluate(() => scrollY)).toBe(pageY);
});

test("the dot field draws while seen, stops on a hidden tab and after the home page unmounts", async ({ page }) => {
  await countDotFrames(page);
  await openHome(page);
  await page.mouse.move(900, 300); // near the field: wake it
  expect(await framesOver(page, 500)).toBeGreaterThan(0);

  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.waitForTimeout(100); // the frame in flight
  expect(await framesOver(page, 600)).toBe(0);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => false });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.mouse.move(950, 320);
  expect(await framesOver(page, 500)).toBeGreaterThan(0);

  // Leave the home page in the app (client navigation): the field unmounts and stops.
  await page.locator('[data-tile="about"]').click();
  await expect(page).toHaveURL(/\/about\/?$/);
  await page.waitForTimeout(400);
  expect(await framesOver(page, 600)).toBe(0);
});

test("a magnetic button follows the pointer and springs back", async ({ page }) => {
  await page.goto("/work", { waitUntil: "networkidle" });
  const next = page.getByRole("button", { name: "Next project" });
  const box = (await next.boundingBox())!;
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await page.mouse.move(cx + 12, cy + 8, { steps: 6 });
  await expect.poll(() => next.evaluate((el) => getComputedStyle(el).transform)).not.toBe("none");
  await page.mouse.move(cx + 300, cy - 300, { steps: 6 });
  await expect.poll(() => next.evaluate((el) => (el as HTMLElement).style.transform), { timeout: 3000 }).toMatch(/^(|none|translate\(0px, 0px\)|translate3d\(0px, 0px, 0px\))$/);
});
