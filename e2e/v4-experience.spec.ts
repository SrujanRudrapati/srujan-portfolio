import { expect, test } from "@playwright/test";
import { timeline } from "../src/data/experience";
import { expectNoA11yViolations } from "./helpers";

// Runbook v4 W5: the Experience timeline.
const items = timeline();
const detail = (page: import("@playwright/test").Page) => page.locator("#experience-detail");

test.describe("v4 experience timeline", () => {
  test("one bar per role and the milestone, in lanes with the year axis and Today", async ({ page }) => {
    await page.goto("/experience");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Experience");
    const bars = page.locator("[data-item]");
    await expect(bars).toHaveCount(items.length);
    for (const i of items) await expect(page.getByRole("button", { name: `${i.title}, ${i.when}` })).toHaveAttribute("aria-pressed", /true|false/);
    for (const y of ["2023", "2024", "2025", "2026", "2027"]) await expect(page.getByRole("region", { name: "Timeline" }).getByText(y, { exact: true })).toBeAttached();
    await expect(page.getByText("Today", { exact: true })).toBeAttached();
  });

  test("opens on the current role, and the server HTML already has it", async ({ page, request }) => {
    const html = await (await request.get("/experience")).text();
    expect(html).toContain("Tech Assistant, Surplus Operations");
    await page.goto("/experience");
    await expect(page.locator('[data-item="role-tech-assistant-asu"]')).toHaveAttribute("aria-pressed", "true");
    await expect(detail(page).getByRole("heading", { level: 2 })).toHaveText("Tech Assistant, Surplus Operations");
    await expect(detail(page).getByText("June 2026 to present")).toBeVisible();
    await expect(detail(page).getByRole("link", { name: "Surplus Station" })).toHaveAttribute("href", /\/work\/surplus-station\/?$/);
  });

  test("selecting a bar shows that role’s dates, organisation, figures and every outcome", async ({ page }) => {
    await page.goto("/experience");
    const associate = items.find((i) => i.id === "role-associate-celebal")!;
    const bar = page.locator('[data-item="role-associate-celebal"]');
    await bar.scrollIntoViewIfNeeded();
    await bar.click();
    await expect(bar).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator('[data-item="role-tech-assistant-asu"]')).toHaveAttribute("aria-pressed", "false");
    await expect(detail(page).getByRole("heading", { level: 2 })).toHaveText("Associate, Data Engineering");
    await expect(detail(page).getByText("September 2022 to November 2024")).toBeVisible();
    await expect(detail(page).getByText("Celebal Technologies")).toBeVisible();
    await expect(detail(page).getByRole("list", { name: "Figures" }).getByRole("listitem")).toHaveCount(3);
    await expect(detail(page).locator("ul:not([aria-label]) > li")).toHaveCount(associate.outcomes.length);
  });

  test("the keyboard reaches every bar; the milestone opens the DevHacks win with its page link", async ({ page }) => {
    await page.goto("/experience");
    const win = page.locator('[data-item="event-devhacks-win"]');
    await win.focus();
    await page.keyboard.press("Enter");
    await expect(win).toHaveAttribute("aria-pressed", "true");
    await expect(detail(page).getByRole("heading", { level: 2 })).toHaveText("1st place, DevHacks × Cubbie hackathon");
    await expect(detail(page).getByText(/82 submissions from 350\+ students/)).toBeVisible();
    await expect(detail(page).getByRole("link", { name: /DevHacks × Cubbie page/ })).toHaveAttribute("href", /\/work\/devhacks-cubbie\/?$/);
  });

  test("narrow bars keep their label outside, untruncated", async ({ page, isMobile }) => {
    test.skip(isMobile, "measured at desktop width");
    await page.goto("/experience");
    for (const label of ["Intern", "Tech Assistant", "1st place, DevHacks"]) {
      const tag = page.getByRole("region", { name: "Timeline" }).getByText(label, { exact: true });
      await expect(tag).toBeVisible();
      expect(await tag.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    }
    // Labels inside bars are not cut off either.
    for (const id of ["role-associate-celebal", "role-teaching-assistant-asu"]) {
      expect(await page.locator(`[data-item="${id}"] span`).evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    }
  });

  test("phones scroll the chart sideways inside its panel; the page itself does not overflow", async ({ page, isMobile }) => {
    test.skip(!isMobile, "phone layout");
    await page.goto("/experience");
    const panel = page.getByRole("region", { name: "Timeline" });
    expect(await panel.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
    // It opens scrolled to the right end, so the current role's bar (selected below) is on screen.
    await expect.poll(() => panel.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
    await expect(page.locator('[data-item="role-tech-assistant-asu"]')).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  });

  test("no accessibility violations", async ({ page }) => {
    await page.goto("/experience");
    await expectNoA11yViolations(page);
  });
});
