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

export async function openHome(page: Page) {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
}

/** The home page's Ask box: it opens the command palette in Ask mode; Enter asks (V4). */
export async function askFromHome(page: Page, question: string) {
  const input = page.locator("#home-ask-input");
  await input.scrollIntoViewIfNeeded();
  await input.fill(question);
  await input.press("Enter");
  const combobox = page.getByRole("dialog", { name: "Command palette" }).getByRole("combobox");
  await expect(combobox).toBeFocused();
  await combobox.press("Enter");
}

export async function openExplore(page: Page, lens?: string) {
  await page.goto(lens ? `/explore#lens=${lens}` : "/explore");
  await page.evaluate(() => document.fonts.ready);
}
