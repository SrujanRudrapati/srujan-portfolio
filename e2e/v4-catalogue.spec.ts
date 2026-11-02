import { expect, test, type Page } from "@playwright/test";

// Work catalogue with motion on (follow-up to runbook v4 W9): trackpad gestures add up, the cards
// follow a drag and spring back, and autoplay moves on every 5 s with every pause it promises.
// Other specs run under reduced motion, where there is no autoplay.

test.use({ reducedMotion: "no-preference" });

const count = (page: Page) => page.locator("[data-catalogue-count]");
const stage = (page: Page) => page.locator("[data-stage]");
const toggle = (page: Page) => page.locator("[data-autoplay-toggle]");

async function openWork(page: Page) {
  await page.goto("/work");
  await expect.poll(() => page.locator("[role='group'][aria-label='Layout']").evaluate((el) => (el as HTMLElement).style.getPropertyValue("--sw"))).not.toBe("");
}
/** Where the front card sits relative to the stage's left edge. */
const frontShift = (page: Page) =>
  page.evaluate(() => {
    const s = document.querySelector("[data-stage]")!.getBoundingClientRect();
    const f = document.querySelector("[data-stage] a[data-front]")!.getBoundingClientRect();
    return f.left + f.width / 2 - (s.left + s.width / 2);
  });
/** Keeps the pointer away from the stage and autoplay out of the way of a test that does not want it. */
async function pauseAutoplay(page: Page) {
  await toggle(page).click();
  await expect(toggle(page)).toHaveAccessibleName("Play slideshow");
}

test.describe("catalogue gestures", () => {
  test.beforeEach(({ isMobile }) => test.skip(isMobile, "wheel and mouse"));

  test("a series of small horizontal wheel deltas advances exactly one card", async ({ page }) => {
    await openWork(page);
    await pauseAutoplay(page);
    const box = (await stage(page).boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    // A trackpad swipe: many 4 to 8 px events, none of which would count alone, plus momentum.
    for (let i = 0; i < 60; i++) await page.mouse.wheel(i < 40 ? 8 : 4, 0);
    await expect(count(page)).toHaveText("2 of 4");
    await page.waitForTimeout(900); // the commit glide, and no second step from the same gesture
    await expect(count(page)).toHaveText("2 of 4");
    await expect.poll(() => frontShift(page).then(Math.abs)).toBeLessThan(1);
    // A long swipe is still one card.
    for (let i = 0; i < 120; i++) await page.mouse.wheel(12, 0);
    await expect(count(page)).toHaveText("3 of 4");
    await page.waitForTimeout(900);
    await expect(count(page)).toHaveText("3 of 4");
  });

  test("the cards follow a horizontal wheel gesture while it lasts", async ({ page }) => {
    await openWork(page);
    await pauseAutoplay(page);
    const box = (await stage(page).boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    for (let i = 0; i < 10; i++) await page.mouse.wheel(6, 0);
    expect(await frontShift(page)).toBeLessThan(-40); // moved with the gesture, towards the next card
  });

  test("a vertical wheel over the stage still scrolls the page", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 600 });
    await openWork(page);
    const box = (await stage(page).boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + 40);
    for (let i = 0; i < 4; i++) await page.mouse.wheel(0, 120);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
    await expect(count(page)).toHaveText("1 of 4");
  });

  test("a drag follows the pointer 1:1, and below the threshold springs back without opening", async ({ page }) => {
    await openWork(page);
    await pauseAutoplay(page);
    const box = (await stage(page).boundingBox())!;
    const x0 = box.x + box.width * 0.6;
    const y = box.y + box.height / 2;
    await page.mouse.move(x0, y);
    await page.mouse.down();
    for (let x = 10; x <= 100; x += 10) {
      await page.mouse.move(x0 - x, y);
      await page.waitForTimeout(30); // about 0.3 px/ms: not a flick
    }
    await expect.poll(() => frontShift(page)).toBeCloseTo(-100, -1);
    await page.waitForTimeout(150);
    await page.mouse.up();
    await expect(count(page)).toHaveText("1 of 4");
    await expect.poll(() => frontShift(page).then(Math.abs)).toBeLessThan(1);
    await expect(page).toHaveURL(/\/work\/?$/); // a 100px drag is not a click
  });

  test("a quick flick advances even when short", async ({ page }) => {
    await openWork(page);
    await pauseAutoplay(page);
    const box = (await stage(page).boundingBox())!;
    const x0 = box.x + box.width * 0.6;
    const y = box.y + box.height / 2;
    await page.mouse.move(x0, y);
    await page.mouse.down();
    await page.mouse.move(x0 - 80, y, { steps: 4 });
    await page.mouse.up();
    await expect(count(page)).toHaveText("2 of 4");
    await expect(page).toHaveURL(/\/work\/?$/);
  });

  test("a vertical gesture stays vertical: sideways drift at its end does not move a card", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 600 });
    await openWork(page);
    await pauseAutoplay(page);
    const box = (await stage(page).boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + 40);
    for (let i = 0; i < 6; i++) await page.mouse.wheel(0, 40);
    for (let i = 0; i < 4; i++) await page.mouse.wheel(30, 2); // drift inside the same gesture
    await page.waitForTimeout(900);
    await expect(count(page)).toHaveText("1 of 4");
    await expect.poll(() => frontShift(page).then(Math.abs)).toBeLessThan(1);
  });

  test("losing window focus mid-drag springs the cards back, and gestures still work after", async ({ page }) => {
    await openWork(page);
    await pauseAutoplay(page);
    const box = (await stage(page).boundingBox())!;
    const y = box.y + box.height / 2;
    await page.mouse.move(box.x + box.width * 0.6, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.6 - 120, y, { steps: 6 });
    await page.evaluate(() => dispatchEvent(new Event("blur")));
    await expect.poll(() => frontShift(page).then(Math.abs)).toBeLessThan(1);
    await page.mouse.up();
    await expect(count(page)).toHaveText("1 of 4");
    await page.mouse.wheel(120, 0);
    await expect(count(page)).toHaveText("2 of 4");
  });

  test("arrows, pills and click-to-open still work with motion on", async ({ page }) => {
    await openWork(page);
    await page.getByRole("button", { name: "Next project" }).click();
    await expect(count(page)).toHaveText("2 of 4");
    await page.getByRole("button", { name: /^Show / }).nth(3).click();
    await expect(count(page)).toHaveText("4 of 4");
    await page.waitForTimeout(800);
    await page.locator("[data-stage] a[data-front]").click();
    await expect(page).toHaveURL(/\/work\/[a-z-]+\/?$/);
  });
});

test.describe("catalogue autoplay", () => {
  test.beforeEach(async ({ page }) => {
    await page.mouse.move(2, 2); // away from the stage
  });

  test("advances after 5 seconds, and not before", async ({ page }) => {
    await openWork(page);
    await page.waitForTimeout(4000);
    await expect(count(page)).toHaveText("1 of 4");
    await expect(count(page)).toHaveText("2 of 4", { timeout: 3000 });
  });

  test("pauses while the pointer is over the stage", async ({ page, isMobile }) => {
    test.skip(isMobile, "hover");
    await openWork(page);
    const box = (await stage(page).boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(6500);
    await expect(count(page)).toHaveText("1 of 4");
    await page.mouse.move(2, 2);
    await expect(count(page)).toHaveText("2 of 4", { timeout: 7000 });
  });

  test("the pause button stops it and play starts it again", async ({ page }) => {
    await openWork(page);
    await expect(toggle(page)).toHaveAccessibleName("Pause slideshow");
    await toggle(page).click();
    await page.mouse.move(2, 2);
    await page.locator("body").evaluate(() => (document.activeElement as HTMLElement | null)?.blur()); // focus on the button is not keyboard focus, but be sure
    await page.waitForTimeout(6500);
    await expect(count(page)).toHaveText("1 of 4");
    await toggle(page).click();
    await expect(toggle(page)).toHaveAccessibleName("Pause slideshow");
    await page.locator("body").evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await expect(count(page)).toHaveText("2 of 4", { timeout: 7000 });
  });

  test("keyboard focus in the catalogue pauses it until play is pressed", async ({ page }) => {
    await openWork(page);
    await stage(page).focus(); // programmatic focus after a key press counts as keyboard focus
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(toggle(page)).toHaveAccessibleName("Play slideshow");
    await page.keyboard.press("Tab"); // and leaving again does not restart it
    await page.waitForTimeout(6000);
    await expect(count(page)).toHaveText("1 of 4");
  });

  test("holds 8 seconds after a manual move", async ({ page }) => {
    await openWork(page);
    await page.getByRole("button", { name: "Next project" }).click();
    await page.mouse.move(2, 2);
    await page.locator("body").evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await expect(count(page)).toHaveText("2 of 4");
    await page.waitForTimeout(9000); // a plain 5 s timer would have moved on by now
    await expect(count(page)).toHaveText("2 of 4");
    await expect(count(page)).toHaveText("3 of 4", { timeout: 6000 });
  });

  test("holds on a hidden tab", async ({ page }) => {
    await openWork(page);
    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await page.waitForTimeout(6500);
    await expect(count(page)).toHaveText("1 of 4");
  });

  test("the current pill fills while it runs", async ({ page, isMobile }) => {
    test.skip(isMobile, "pills are hidden on phones");
    await openWork(page);
    const fill = () =>
      page.locator("[data-stage] ~ div button[aria-current='true']").evaluate((el) => {
        const m = getComputedStyle(el, "::after").transform;
        return m === "none" ? 1 : Number(m.split(/[(,]/)[1]);
      });
    await page.waitForTimeout(2500);
    expect(await fill()).toBeGreaterThan(0.2);
    expect(await fill()).toBeLessThan(0.9);
  });
});

test.describe("catalogue under reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("does not autoplay and shows no pause control", async ({ page }) => {
    await page.mouse.move(2, 2);
    await openWork(page);
    await expect(toggle(page)).toBeHidden();
    await page.waitForTimeout(6500);
    await expect(count(page)).toHaveText("1 of 4");
  });
});
