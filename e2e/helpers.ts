import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

export async function expectNoA11yViolations(page: Page, selector?: string) {
  let builder = new AxeBuilder({ page }).withTags(WCAG_TAGS);
  if (selector) builder = builder.include(selector);
  const { violations } = await builder.analyze();
  const summary = violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    help: v.help,
    targets: v.nodes.map((n) => n.target.join(" ")),
  }));
  expect(summary, JSON.stringify(summary, null, 2)).toEqual([]);
}

/** Phones collapse featured card details behind "Show details"; open them where a test needs the inside of a card. */
export async function expandFeatured(page: Page, slug: string) {
  const toggle = page.locator(`#project-${slug} button[aria-controls="${slug}-more"]`);
  if (await toggle.isVisible()) await toggle.click();
}

export async function openHome(page: Page) {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
}
