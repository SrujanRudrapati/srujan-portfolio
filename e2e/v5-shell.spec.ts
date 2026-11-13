import { expect, test } from "@playwright/test";
import { askFromHome, openHome } from "./helpers";

// v5 shell (design/redesign.html) on every page: the nav that slides away while scrolling down,
// the footer, light only, native scroll (no Lenis), and the "View" cursor on fine pointers.

test.describe("v5 shell", () => {
  test("nav: initials home, Projects, About, Contact on the home page's anchors, and Ask", async ({ page, isMobile }) => {
    await page.goto("/about");
    const header = page.locator("body > header");
    await expect(header.getByRole("link", { name: "Srujan Rudrapati, home" })).toHaveAttribute("href", /\/$/);
    const nav = header.getByRole("navigation", { name: "Primary" });
    await expect(nav.getByRole("link", { name: "Projects" })).toHaveAttribute("href", /\/#work$/);
    await expect(nav.getByRole("link", { name: "Contact" })).toHaveAttribute("href", /\/#contact$/);
    // About is hidden on narrow screens, as in the prototype.
    await expect(nav.getByRole("link", { name: "About" })).toHaveCount(isMobile ? 0 : 1);
    await nav.getByRole("button", { name: "Ask" }).click();
    await expect(page.getByRole("dialog", { name: /ask/i })).toBeVisible();
  });

  test("the nav slides away scrolling down and comes back scrolling up", async ({ page }) => {
    await openHome(page);
    const header = page.locator("body > header");
    await page.evaluate(() => scrollTo(0, 900));
    await expect(header).toHaveAttribute("data-up", "");
    await page.evaluate(() => scrollTo(0, 600));
    await expect(header).not.toHaveAttribute("data-up");
  });

  test("light only: colour-scheme light, the paper ground, no theme control", async ({ page }) => {
    await page.goto("/about");
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).toBe("light");
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgb(244, 240, 232)");
    await expect(page.getByRole("button", { name: /theme/i })).toHaveCount(0);
  });

  test("footer: the name and a way back up, nothing about a draft", async ({ page }) => {
    await page.goto("/about");
    const footer = page.locator("body > footer");
    await expect(footer).toContainText("Srujan Rudrapati");
    await expect(footer.getByRole("link", { name: "Back to top" })).toHaveAttribute("href", "#main");
    await expect(footer).not.toContainText(/draft/i);
  });

  test("no smooth-scroll library: the page scrolls natively", async ({ page }) => {
    await openHome(page);
    expect(await page.evaluate(() => document.documentElement.classList.contains("lenis"))).toBe(false);
    await page.evaluate(() => scrollTo(0, 1234));
    expect(await page.evaluate(() => scrollY)).toBe(1234);
  });

  test("a client navigation lands at the top with focus on the new h1", async ({ page }) => {
    await page.goto("/about");
    await page.evaluate(() => scrollTo(0, 600));
    // Scrolling down hides the nav; scrolling back up a little brings it back, as for a visitor.
    // Wait for the hide first: two jumps in one frame reach the page as a single scroll event.
    await expect(page.locator("body > header")).toHaveAttribute("data-up", "");
    await page.evaluate(() => scrollTo(0, 500));
    await expect(page.locator("body > header")).not.toHaveAttribute("data-up");
    await page.locator("body > header").getByRole("link", { name: "Srujan Rudrapati, home" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("main h1")).toBeFocused();
    expect(await page.evaluate(() => scrollY)).toBe(0);
  });

  test("reduced motion: no custom cursor appears", async ({ page }) => {
    await openHome(page);
    await page.mouse.move(400, 300);
    await page.mouse.move(420, 320);
    await expect(page.locator("[class*='cursor'][data-on]")).toHaveCount(0);
  });
});

test.describe("v5 shell with motion", () => {
  test.use({ reducedMotion: "no-preference" });

  test("the View cursor grows over a More projects row and hides elsewhere", async ({ page, isMobile }) => {
    test.skip(isMobile, "fine pointers only");
    await openHome(page);
    const cursor = page.locator("[class*='cursor'][data-on]");
    await expect(cursor).toHaveCount(1);
    const row = page.locator("main a[href$='/work/heatshift']");
    await row.scrollIntoViewIfNeeded();
    const box = (await row.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 4 });
    await expect(cursor).toHaveText("View");
    await expect.poll(() => cursor.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a)).toBeGreaterThan(0.9);
    await page.mouse.move(5, 5, { steps: 4 });
    await expect.poll(() => cursor.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a)).toBeLessThan(0.1);
  });

  test("the wheel scrolls a long Ask answer, not the page behind the dialog", async ({ page, isMobile }) => {
    test.skip(isMobile, "wheel");
    await page.setViewportSize({ width: 1280, height: 720 });
    await openHome(page);
    await askFromHome(page, "What have you done with Spark?");
    const dialog = page.getByRole("dialog", { name: "Ask about my work" });
    await expect(dialog.getByRole("list", { name: "Evidence" })).toBeVisible();
    const scroller = dialog.locator(".overflow-y-auto").first();
    expect(await scroller.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
    const box = (await scroller.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    const pageY = await page.evaluate(() => scrollY);
    for (let i = 0; i < 5; i++) await page.mouse.wheel(0, 200);
    await expect.poll(() => scroller.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
    expect(await page.evaluate(() => scrollY)).toBe(pageY);
  });

  test("the hero draws in, and the page transition still ends with focus on the new h1", async ({ page }) => {
    await openHome(page);
    await expect(page.locator("main h1")).toHaveCSS("opacity", "1", { timeout: 4000 });
    await page.goto("/about");
    await page.locator("body > header").getByRole("link", { name: "Srujan Rudrapati, home" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("main h1")).toBeFocused({ timeout: 5000 });
  });
});
