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

test.describe("Work", () => {
  test("renders both featured projects with honest status and every diagram", async ({ page }) => {
    const work = page.locator("#work");
    await expect(work.getByRole("heading", { level: 2, name: "Work" })).toBeVisible();

    const surplus = work.getByRole("article", { name: "Surplus AI" });
    await expect(surplus).toBeVisible();
    await expect(surplus.getByText("Production", { exact: true })).toBeVisible();
    await expect(surplus.getByRole("img", { name: /Surplus AI pipeline/ })).toBeVisible();
    await expect(surplus.getByText("14B cluster engine in progress")).toBeVisible();

    // The long "How it works" block and the two secondary diagrams sit behind a disclosure.
    const details = surplus.locator("details");
    await expect(details).not.toHaveAttribute("open", "");
    await details.locator("summary").click();
    await expect(surplus.getByRole("img", { name: /Cluster network/ })).toBeVisible();
    await expect(surplus.getByRole("img", { name: /Privacy layers/ })).toBeVisible();
    await expect(surplus.getByRole("term")).toHaveCount(6);

    const watchtower = work.getByRole("article", { name: "Autonomous Supply Chain Watchtower" });
    await expect(watchtower.getByRole("img", { name: /Watchtower agent flow/ })).toBeVisible();
    await expect(watchtower.getByText("Personal", { exact: true })).toBeVisible();
    // Brief rule: Watchtower is never described as shipped, deployed, in production, or having users.
    await expect(watchtower).not.toContainText(/shipped|deployed|production|users/i);
  });

  test("keeps every project: two featured and six in the grid, impact figures loudest", async ({ page }) => {
    const work = page.locator("#work");
    await expect(work.getByRole("article")).toHaveCount(8);
    await expect(work.locator("#projects").getByRole("article")).toHaveCount(6);
    // The Stat figure is the largest text on a featured card.
    const stat = work.getByRole("article", { name: "Surplus AI" }).getByRole("list", { name: "Surplus AI results" }).locator("span").first();
    const title = work.getByRole("heading", { level: 3, name: "Surplus AI" });
    const [statSize, titleSize] = await Promise.all([
      stat.evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
      title.evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
    ]);
    expect(statSize).toBeGreaterThan(titleSize);
  });

  test("filter chips are real buttons with aria-pressed and never change the URL", async ({ page }) => {
    const work = page.locator("#work");
    const url = page.url();
    const all = work.getByRole("button", { name: "All" });
    const production = work.getByRole("button", { name: "Production" });
    await expect(all).toHaveAttribute("aria-pressed", "true");
    await expect(production).toHaveAttribute("aria-pressed", "false");

    await production.click();
    await expect(production).toHaveAttribute("aria-pressed", "true");
    await expect(all).toHaveAttribute("aria-pressed", "false");
    await expect(work.getByRole("article")).toHaveCount(1);
    await expect(work.getByText("1 of 8 projects")).toBeVisible();
    expect(page.url()).toBe(url);

    await work.getByRole("button", { name: "Hackathon" }).click();
    await expect(work.getByText("Nothing matches this filter yet.")).toBeVisible();
    await work.getByRole("button", { name: "Show all projects" }).click();
    await expect(work.getByRole("article")).toHaveCount(8);
  });

  test("a linked grid card is one tab stop whose anchor is the title", async ({ page, isMobile }) => {
    test.skip(isMobile, "Keyboard-only check");
    const card = page.locator("#project-aws-cicd-pipeline");
    const link = card.getByRole("link", { name: /End-to-End CI\/CD Deployment Pipeline/ });
    await expect(link).toHaveAttribute("href", "https://github.com/SrujanRudrapati/aws-cicd-pipeline");
    await expect(card.getByRole("link")).toHaveCount(1);
    await link.focus();
    await expect(link).toBeFocused();
    // Cards with nowhere to go have no tab stop at all.
    await expect(page.locator("#project-java-group-chat").getByRole("link")).toHaveCount(0);
  });

  test("diagrams are static and fully lit under reduced motion", async ({ page }) => {
    // The suite runs with reducedMotion: "reduce", so dots must be hidden and overlays opaque.
    const figure = page.locator(".flow").first();
    await figure.scrollIntoViewIfNeeded();
    // useInView flips data-animate on the next IntersectionObserver tick.
    await expect(figure).toHaveAttribute("data-animate", "on");
    const state = await figure.evaluate((el) => {
      const svg = Array.from(el.querySelectorAll("svg")).find((s) => getComputedStyle(s).display !== "none")!;
      const dot = svg.querySelector(".flow-dot")!;
      const lit = svg.querySelector(".flow-lit")!;
      return { dot: getComputedStyle(dot).display, lit: getComputedStyle(lit).opacity, animate: el.getAttribute("data-animate") };
    });
    expect(state.dot).toBe("none");
    expect(state.lit).toBe("1");
    expect(state.animate).toBe("on");
  });

  test("has no accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "#work");
  });

  test("visual", async ({ page }) => {
    await expect(page.locator("#work")).toHaveScreenshot("work.png");
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
