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

/** The home page, hydrated: shortcuts such as ⌘K are listened for only after hydration, and a key pressed
 *  before it does nothing (the cause of a flaky Ask test under load, V7). The v5 thread sets `data-ready`
 *  in an effect, after hydration, once it has measured the page. */
export async function openHome(page: Page) {
  await page.goto("/");
  await expect(page.locator("svg[data-thread][data-ready]")).toHaveCount(1);
  await page.evaluate(() => document.fonts.ready);
}

/** The home page's "Ask about my work" (v5: in Let's talk): it opens the Ask panel; the question goes in its input. */
export async function askFromHome(page: Page, question: string) {
  await page.getByRole("button", { name: "Ask about my work" }).click();
  const input = page.getByRole("dialog", { name: "Ask about my work" }).locator("#ask-input");
  await expect(input).toBeFocused();
  await input.fill(question);
  await input.press("Enter");
}

/** /explore, hydrated: Explore sets html[data-lens] in an effect, so a lens click after this is handled
 *  (WebKit hydrates later than Chrome, and a click before hydration does nothing; V7). */
export async function openExplore(page: Page, lens?: string, javaScriptEnabled = true) {
  await page.goto(lens ? `/explore#lens=${lens}` : "/explore");
  if (javaScriptEnabled) await expect(page.locator("html[data-lens]")).toHaveCount(1);
  await page.evaluate(() => document.fonts.ready);
}
