import { expect, test } from "@playwright/test";

// Runbook v4 W1: the shell on every page.

test.describe("v4 shell", () => {
  test("header holds only the name and the availability line, and frosts after 30px", async ({ page }) => {
    await page.goto("/about");
    const header = page.locator("body > header");
    await expect(header.getByRole("link")).toHaveCount(1);
    await expect(header.getByRole("link", { name: "Srujan Rudrapati" })).toHaveAttribute("href", /\/$/);
    await expect(header).toContainText("Available early 2027");
    await expect(header.locator("nav")).toHaveCount(0);
    await expect(header).not.toHaveAttribute("data-solid");
    await page.evaluate(() => scrollTo(0, 200));
    await expect(header).toHaveAttribute("data-solid", "");
    expect(await header.evaluate((el) => getComputedStyle(el).backdropFilter)).toContain("blur");
  });

  test("dark only: colour-scheme dark, the midnight background, no theme control", async ({ page }) => {
    await page.goto("/");
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).toBe("dark");
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--bg").trim().toLowerCase())).toBe("#0b0f14");
    await expect(page.getByRole("button", { name: /theme/i })).toHaveCount(0);
  });

  test("footer: name, year and Arizona time, nothing about a draft", async ({ page }) => {
    await page.goto("/about");
    const footer = page.locator("footer").last();
    await expect(footer).toContainText(`Srujan Rudrapati, ${new Date().getFullYear()}`);
    await expect(footer.locator("[data-clock]")).toHaveText(/^Arizona, \d{1,2}:\d{2}\s?[AP]M$/);
    await expect(footer).not.toContainText(/draft/i);
  });

  test("scroll progress line follows the page", async ({ page }) => {
    await page.goto("/about");
    const line = page.locator("div[aria-hidden='true'][class*='progress']");
    await expect(line).toHaveCount(1);
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await expect.poll(() => line.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a)).toBeGreaterThan(0.95);
  });

  test("a client navigation lands at the top with focus on the new h1", async ({ page }) => {
    await page.goto("/about");
    await page.evaluate(() => scrollTo(0, 600));
    await page.locator("body > header").getByRole("link", { name: "Srujan Rudrapati" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("main h1")).toBeFocused();
    expect(await page.evaluate(() => scrollY)).toBe(0);
  });

  test("reduced motion: no custom cursor appears", async ({ page }) => {
    await page.goto("/about");
    await page.mouse.move(400, 300);
    await page.mouse.move(420, 320);
    await expect(page.locator("[class*='cursor'][data-on]")).toHaveCount(0);
  });
});

test.describe("v4 shell with motion", () => {
  test.use({ reducedMotion: "no-preference" });

  test("cursor follows a fine pointer and grows over links", async ({ page, isMobile }) => {
    test.skip(isMobile, "fine pointers only");
    await page.goto("/about");
    await page.mouse.move(600, 400);
    await page.mouse.move(610, 410);
    const ring = page.locator("[class*='cursor'][data-on]");
    await expect(ring).toHaveCount(1);
    const mark = page.locator("body > header").getByRole("link", { name: "Srujan Rudrapati" });
    const box = await mark.boundingBox();
    if (!box) throw new Error("no header link");
    await page.mouse.move(box.x + 10, box.y + box.height / 2);
    await expect(ring).toHaveAttribute("data-state", "hover");
  });

  test("the page transition still ends with focus on the new h1", async ({ page }) => {
    await page.goto("/about");
    await page.locator("body > header").getByRole("link", { name: "Srujan Rudrapati" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("main h1")).toBeFocused({ timeout: 5000 });
  });
});
