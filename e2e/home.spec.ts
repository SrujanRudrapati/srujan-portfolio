import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function expectNoA11yViolations(page: Page, selector?: string) {
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

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
});

test.describe("Navigation", () => {
  test("has the section links, a Resume link that opens in a new tab, and a theme toggle", async ({ page, isMobile }) => {
    const header = page.getByRole("banner");
    await expect(header.getByRole("link", { name: "Srujan Rudrapati" })).toHaveAttribute("href", "#top");
    // On a phone the Resume link lives in the menu panel, so open it first.
    if (isMobile) await page.getByRole("button", { name: "Open menu" }).click();
    const resume = header.getByRole("link", { name: "Resume" }).first();
    await expect(resume).toHaveAttribute("href", "/resume.pdf");
    await expect(resume).toHaveAttribute("target", "_blank");
    await expect(header.getByRole("button", { name: /theme/ })).toBeVisible();

    if (isMobile) return;
    for (const name of ["About", "Work", "Experience", "Skills", "Contact"]) {
      await expect(header.getByRole("link", { name, exact: true })).toBeVisible();
    }
  });

  test("marks the section in view with aria-current", async ({ page, isMobile }) => {
    test.skip(isMobile, "Desktop links only");
    const link = page.getByRole("banner").getByRole("link", { name: "Experience", exact: true });
    await expect(link).not.toHaveAttribute("aria-current", "location");
    await page.evaluate(() => document.getElementById("experience")?.scrollIntoView({ block: "start" }));
    await expect(link).toHaveAttribute("aria-current", "location");
  });

  test("gains a border after scrolling 20px", async ({ page }) => {
    const header = page.getByRole("banner");
    await expect(header).not.toHaveAttribute("data-scrolled", "");
    await page.evaluate(() => window.scrollTo(0, 200));
    await expect(header).toHaveAttribute("data-scrolled", "");
  });

  test("mobile menu opens, traps focus, closes on Escape and on link click", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Mobile menu only");
    const button = page.getByRole("button", { name: "Open menu" });
    const panel = page.locator("#mobile-menu");
    await expect(panel).toBeHidden();

    await button.click();
    await expect(panel).toBeVisible();
    await expect(page.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("html")).toHaveCSS("overflow", "hidden");

    // Tab from the last focusable wraps back to the first; focus never leaves the header.
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      const inHeader = await page.evaluate(() => !!document.activeElement?.closest("header"));
      expect(inHeader).toBe(true);
    }

    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
    await expect(page.locator("html")).not.toHaveCSS("overflow", "hidden");

    await button.click();
    await panel.getByRole("link", { name: "Work" }).click();
    await expect(panel).toBeHidden();
    await expect(page).toHaveURL(/#work$/);
  });
});

test.describe("Hero", () => {
  test("renders headline, sub-line, calls to action, proof chips and diagram", async ({ page }) => {
    const hero = page.locator("#top");
    await expect(hero.getByRole("heading", { level: 1 })).toHaveText(
      "I build the data layer, and the AI on top of it.",
    );
    await expect(hero.getByText("Data engineer working across Databricks, Azure, and AWS.")).toBeVisible();

    await expect(hero.getByRole("link", { name: "See my work" })).toHaveAttribute("href", "#work");
    await expect(hero.getByRole("link", { name: "Get in touch" })).toHaveAttribute("href", "#contact");

    const chips = hero.getByRole("list", { name: "Highlights" });
    await expect(chips.getByRole("listitem")).toHaveText([
      "Surplus AI, in active use at ASU Surplus",
      "Two years of data engineering at Celebal",
      "Databricks Certified Data Engineer Professional",
    ]);

    await expect(hero.getByRole("img", { name: /Data pipeline from source systems/ })).toBeVisible();
  });

  test("fits above the fold on a phone", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Phone viewport only");
    const chips = page.locator("#top").getByRole("list", { name: "Highlights" });
    const box = await chips.boundingBox();
    const viewport = page.viewportSize();
    expect(box).not.toBeNull();
    expect(viewport).not.toBeNull();
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewport!.height);
  });

  test("skip link moves focus target to main content", async ({ page, isMobile }) => {
    test.skip(isMobile, "Keyboard-only check");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });

  test("has no accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "#top");
  });

  test("visual", async ({ page }) => {
    await expect(page.locator("#top")).toHaveScreenshot("hero.png");
  });
});

test.describe("Featured work", () => {
  test("renders both case studies with honest status", async ({ page }) => {
    const work = page.locator("#work");
    await expect(work.getByRole("heading", { level: 2, name: "Featured work" })).toBeVisible();

    const surplus = work.getByRole("article", { name: "Surplus AI" });
    await expect(surplus).toBeVisible();
    await expect(surplus.getByRole("list", { name: "Surplus AI pipeline" })).toBeVisible();
    await expect(surplus.getByRole("group", { name: "Cluster network" })).toBeVisible();
    await expect(surplus.getByRole("group", { name: /Privacy layers/ })).toBeVisible();
    await expect(surplus.getByText("14B cluster engine in progress")).toBeVisible();
    await expect(surplus.getByRole("listitem").filter({ hasText: /^Node \d/ })).toHaveCount(5);

    const watchtower = work.getByRole("article", { name: "Autonomous Supply Chain Watchtower" });
    await expect(watchtower.getByRole("list", { name: "Watchtower agent flow" })).toBeVisible();
    await expect(watchtower.getByText("Personal prototype")).toBeVisible();
    // Brief rule: Watchtower is never described as shipped, deployed, in production, or having users.
    await expect(watchtower).not.toContainText(/shipped|deployed|production|users/i);
  });

  test("has no accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "#work");
  });

  test("visual", async ({ page }) => {
    await expect(page.locator("#work")).toHaveScreenshot("featured-work.png");
  });
});

test.describe("Experience", () => {
  test("renders all three roles with brief-approved titles", async ({ page }) => {
    const exp = page.locator("#experience");
    const titles = exp.getByRole("heading", { level: 3 });
    await expect(titles).toHaveText([
      "Tech Assistant, Surplus Operations",
      "Graduate Teaching Assistant",
      "Associate, Data Engineering",
    ]);

    const celebal = exp.getByRole("article").filter({ hasText: "Celebal Technologies" });
    await expect(celebal.getByRole("heading", { level: 4 })).toHaveCount(9);
    await expect(celebal).toContainText("Time-to-insight dropped about 50%");
    await expect(celebal).toContainText("Cut downtime about 30%");
    // Brief rules: no inflated titles, no "led" or "managed".
    await expect(exp).not.toContainText(/\b(senior|lead|architect|managed)\b/i);
  });

  test("has no accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "#experience");
  });

  test("visual", async ({ page }) => {
    await expect(page.locator("#experience")).toHaveScreenshot("experience.png");
  });
});

test.describe("Whole page", () => {
  test("has no accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page);
  });

  test("follows copy rules from the brief", async ({ page }) => {
    const text = await page.locator("body").innerText();
    expect(text, "em/en dashes are banned").not.toMatch(/[—–]/);
    expect(text).not.toMatch(/\b(leverage|seamless|robust|cutting-edge|passionate|synergy|spearheaded|utilize|delve)\b/i);
  });

  test("never scrolls horizontally", async ({ page }) => {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
