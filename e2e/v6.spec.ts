import { expect, test, type Page } from "@playwright/test";
import { expectNoA11yViolations } from "./helpers";

// Runbook V6: the 404 game, the game from the palette, and the Flip on lens switches.

const board = (page: Page) => page.getByRole("application", { name: /Game board/ });

test.describe("Clean the pipeline (404)", () => {
  test("the 404 says no row came back, links every page, and hosts the game", async ({ page }) => {
    await page.goto("/no-such-page");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Row not found");
    for (const name of ["Home", "Work", "Explore", "About", "CV"]) await expect(page.locator("main").getByRole("link", { name, exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Clean the pipeline" })).toBeVisible();
    await expectNoA11yViolations(page, "main");
  });

  test("never starts by itself; Start runs it, Space pauses, and a run ends with the score announced", async ({ page, isMobile }) => {
    test.skip(isMobile, "Keyboard play is checked on desktop; touch below");
    await page.goto("/no-such-page");
    const game = page.getByRole("region", { name: "Clean the pipeline" });
    await expect(board(page)).toHaveAttribute("data-phase", "ready");
    await page.waitForTimeout(500);
    await expect(board(page)).toHaveAttribute("data-phase", "ready");
    await game.getByRole("button", { name: "Start" }).click();
    await expect(board(page)).toHaveAttribute("data-phase", "playing");
    await expect(board(page)).toBeFocused();
    await page.keyboard.press("Space");
    await expect(game.getByRole("button", { name: "Resume" })).toBeVisible();
    await game.getByRole("button", { name: "Resume" }).click();
    // Park the filter at the far right; records that fall elsewhere get through, so the run ends.
    await board(page).focus();
    await page.keyboard.down("ArrowRight");
    await expect(game.getByText(/Pipeline stopped\./)).toBeVisible({ timeout: 40_000 });
    await page.keyboard.up("ArrowRight");
    await expect(game.getByText(/^lives\s*0$/)).toBeVisible();
    await expect(page.locator('[aria-live="polite"]', { hasText: /Game over\. Score \d+\./ })).toHaveCount(1);
    await expect(game.getByRole("button", { name: "Play again" })).toBeVisible();
  });

  test("on phones a drag on the board steers, and the board only blocks scrolling while playing", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Touch");
    await page.goto("/no-such-page");
    await expect(board(page)).toHaveCSS("touch-action", "auto");
    await page.getByRole("region", { name: "Clean the pipeline" }).getByRole("button", { name: "Start" }).tap();
    await expect(board(page)).toHaveCSS("touch-action", "none");
  });
});

test.describe("Clean the pipeline (command palette)", () => {
  test("opens from the palette in a dialog; Escape closes it and returns focus", async ({ page, isMobile }) => {
    test.skip(isMobile, "Keyboard flow");
    await page.goto("/");
    const opener = page.getByRole("banner").getByRole("button", { name: /Search/ });
    await opener.click();
    await page.keyboard.type("game");
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Clean the pipeline" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Start" })).toBeFocused();
    await expectNoA11yViolations(page, "dialog");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  });
});

test.describe("Explore: lens switches", () => {
  const panelItems = (page: Page) => page.locator("#work [data-lens-panel]:not([hidden]) [data-flip-id]");

  test.describe("with motion", () => {
    test.use({ reducedMotion: "no-preference" });
    test("a switch animates the shared items (Flip) and ends with everything settled", async ({ page, isMobile }) => {
      test.skip(isMobile, "Checked on desktop");
      await page.goto("/explore");
      // Warm up: the first switch loads graph.json and the lens code, and a switch that waits longer than
      // FLIP_WAIT_MS is shown without a transition by design. Load it once, come back, then switch again.
      await page.getByRole("button", { name: "Timeline" }).click();
      await expect.poll(() => panelItems(page).count()).toBeGreaterThan(0);
      await page.getByRole("button", { name: "Highlights" }).click();
      await expect.poll(() => panelItems(page).evaluateAll((els) => els.length > 0 && els.every((el) => getComputedStyle(el).opacity === "1"))).toBe(true);
      await page.getByRole("button", { name: "Timeline" }).click();
      // Mid-transition some item carries GSAP's inline transform or opacity…
      await expect.poll(() => panelItems(page).evaluateAll((els) => els.some((el) => /transform|opacity/.test(el.getAttribute("style") ?? "")))).toBe(true);
      // …and once it is done every item is fully visible.
      await expect.poll(() => panelItems(page).evaluateAll((els) => els.every((el) => getComputedStyle(el).opacity === "1")), { timeout: 3000 }).toBe(true);
    });
  });

  test("under reduced motion the switch is instant: no inline animation styles", async ({ page }) => {
    await page.goto("/explore");
    await page.getByRole("button", { name: "Timeline" }).click();
    await expect.poll(() => panelItems(page).count()).toBeGreaterThan(0);
    expect(await panelItems(page).evaluateAll((els) => els.filter((el) => /transform|opacity/.test(el.getAttribute("style") ?? "")).length)).toBe(0);
  });
});
