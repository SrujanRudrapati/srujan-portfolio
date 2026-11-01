import { expect, test } from "@playwright/test";
import { expectNoA11yViolations } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
});

test.describe("Navigation (v3: pages, not sections)", () => {
  test("has the name, the four pages, a Resume link that opens in a new tab, and the palette button", async ({ page, isMobile }) => {
    const header = page.getByRole("banner");
    await expect(header.getByRole("link", { name: "Srujan Rudrapati" })).toHaveAttribute("href", "/");
    const resume = header.getByRole("link", { name: "Resume" });
    await expect(resume).toHaveAttribute("href", "/resume.pdf");
    await expect(resume).toHaveAttribute("target", "_blank");
    await expect(header.getByRole("button", { name: isMobile ? /Menu/ : /Search/ })).toBeVisible();
    if (isMobile) return;
    await expect(header.getByRole("button", { name: /theme/ })).toBeVisible();
    const nav = page.getByRole("navigation", { name: "Main" });
    for (const [name, href] of [["Work", "/work"], ["Explore", "/explore"], ["About", "/about"], ["CV", "/cv"]]) {
      await expect(nav.getByRole("link", { name })).toHaveAttribute("href", href);
    }
  });

  test("marks the current page with aria-current", async ({ page, isMobile }) => {
    test.skip(isMobile, "Desktop links only");
    await expect(page.getByRole("banner").getByRole("link", { name: "Srujan Rudrapati" })).toHaveAttribute("aria-current", "page");
    await page.goto("/about");
    await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "About" })).toHaveAttribute("aria-current", "page");
  });
});

test.describe("Hero (V4: stage 01 / ingest)", () => {
  test("says who, what, where now, with proof and the way in", async ({ page }) => {
    const hero = page.locator('[data-stage="ingest"]');
    await expect(hero.getByRole("heading", { level: 1 })).toHaveText("Srujan Rudrapati");
    await expect(hero.getByText("I build the data layer, and the AI on top of it.")).toBeVisible();
    await expect(hero.getByText("M.S. student at Arizona State University.")).toBeVisible();
    await expect(hero.getByRole("list", { name: "Highlights" }).getByRole("listitem")).toHaveText([
      "Surplus AI, in production at ASU Surplus",
      "Associate at Celebal Technologies (2022 to 2024)",
      "Databricks Certified Data Engineer Professional",
    ]);
    await expect(hero.getByRole("link", { name: "See my work" })).toHaveAttribute("href", "/work");
    await expect(hero.getByRole("link", { name: "Resume" })).toHaveAttribute("href", "/resume.pdf");
    await expect(hero.getByRole("link", { name: "rudrapati.srujan@gmail.com" })).toHaveAttribute("href", "mailto:rudrapati.srujan@gmail.com");
    await expect(hero.getByRole("img", { name: /Medallion architecture as a particle stream/ })).toBeVisible();
  });

  test("who, what and contact are on the first screen of a phone", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Phone viewport only");
    // Who (name), what (the line and sub-line), proof (~80%) and contact (Resume in the bar, the email) on screen 1.
    const viewport = page.viewportSize()!;
    const hero = page.locator('[data-stage="ingest"]');
    for (const el of [hero.getByRole("heading", { level: 1 }), hero.getByText("I build the data layer"), hero.getByText("~80%").first(), page.getByRole("banner").getByRole("link", { name: "Resume" }), hero.getByRole("link", { name: /@/ })]) {
      await expect(el).toBeVisible();
      const box = await el.boundingBox();
      expect(box!.y).toBeGreaterThanOrEqual(0);
      expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height);
    }
  });

  test("phone hero art stays under a third of the screen, below the email (390 and 360)", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Phone viewport only");
    for (const width of [390, 360]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/");
      const art = await page.locator('[data-stage="ingest"] [data-scene="hero-stream"]').boundingBox();
      const email = await page.locator('[data-stage="ingest"]').getByRole("link", { name: /@/ }).boundingBox();
      expect(art!.height).toBeLessThanOrEqual(844 / 3);
      expect(email!.y + email!.height).toBeLessThanOrEqual(844);
      expect(art!.y).toBeGreaterThanOrEqual(email!.y + email!.height);
    }
  });

  test("skip link moves focus target to main content", async ({ page, isMobile }) => {
    test.skip(isMobile, "Keyboard-only check");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });

  test("the four featured projects, in order, each open their case study", async ({ page }) => {
    const reel = page.getByRole("list", { name: "Selected work (scrolls sideways)" });
    await expect(reel.getByRole("heading", { level: 3 })).toHaveText(["Surplus AI", "DevHacks × Cubbie hackathon", "Label Lens", "Autonomous Supply Chain Watchtower"]);
    for (const slug of ["surplus-ai", "devhacks-cubbie", "label-lens", "supply-chain-watchtower"]) await expect(reel.locator(`a[href="/work/${slug}"]`)).toHaveCount(1);
    await expect(page.getByRole("link", { name: /^All \d+ projects$/ })).toHaveAttribute("href", "/work");
  });

  test("figures are in the server HTML with their markers", async ({ request }) => {
    // The raw export, before any script runs: each figure's final text and marker, as often as the page shows it
    // (reel panel + proof row for ~80%; four reel figures and five proof figures in all).
    const html = await (await request.get("/")).text();
    // ~80% once as a counter (the Surplus AI panel); the hero shows it as plain text and the strip leaves it out (DECISIONS 13).
    const expected: Record<string, number> = { "~80%": 1, "1st": 1, "44/44": 1, "3": 1, "~10 min": 1, "about 10 million": 1, "82": 1, "4 to 9 s": 1, "about 28%": 1 };
    for (const [v, n] of Object.entries(expected)) {
      const tags = html.match(new RegExp(`data-count="${v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}">([^<]*)<`, "g")) ?? [];
      expect(tags, v).toHaveLength(n);
      for (const t of tags) expect(t.endsWith(`>${v}<`), v).toBe(true);
    }
  });

  test("has no accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "main");
  });

  test("visual", async ({ page }) => {
    await expect(page.locator('[data-stage="ingest"]')).toHaveScreenshot("hero.png", { mask: [page.locator("[data-scene]")] });
  });
});

test.describe("Work index (/work, V6)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/work");
    await page.evaluate(() => document.fonts.ready);
  });

  test("keeps every project: four featured in facts order, seven compact rows, each opening its case study", async ({ page }) => {
    const main = page.locator("main");
    await expect(page.getByRole("heading", { level: 1, name: "Work" })).toBeVisible();
    // Facts: featured order Surplus AI, DevHacks × Cubbie, Label Lens, Supply Chain Watchtower.
    await expect(main.getByRole("article").getByRole("heading", { level: 2 })).toHaveText(["Surplus AI", "DevHacks × Cubbie hackathon", "Label Lens", "Autonomous Supply Chain Watchtower"]);
    const rows = main.locator("#projects").getByRole("listitem");
    await expect(rows).toHaveCount(7);
    await expect(rows.last().getByRole("heading", { level: 3 })).toHaveText("Hand Gesture Controlled RC Car");
    for (const slug of ["surplus-ai", "label-lens", "f1-race-predictor"]) await expect(main.locator(`#project-${slug} a`)).toHaveAttribute("href", `/work/${slug}`);
    // A featured item leads with its figure and carries its 3D cover.
    const surplus = main.getByRole("article", { name: "Surplus AI" });
    await expect(surplus.getByText("~80%", { exact: true })).toBeVisible();
    await expect(surplus.locator("[data-scene]")).toHaveCount(1);
  });

  test("statuses are honest; Watchtower is never called shipped or in production", async ({ page }) => {
    const main = page.locator("main");
    await expect(main.getByRole("article", { name: "Surplus AI" })).toContainText("production");
    await expect(main).not.toContainText(/in progress|copying/i);
    await expect(main.getByRole("article", { name: "Autonomous Supply Chain Watchtower" })).not.toContainText(/shipped|deployed|production|users/i);
  });

  test("filter chips are real buttons with aria-pressed and never change the URL", async ({ page }) => {
    const main = page.locator("main");
    const url = page.url();
    const all = main.getByRole("button", { name: "All" });
    const production = main.getByRole("button", { name: "Production" });
    const items = main.locator("[data-flip-id]");
    await expect(all).toHaveAttribute("aria-pressed", "true");
    await production.click();
    await expect(production).toHaveAttribute("aria-pressed", "true");
    await expect(all).toHaveAttribute("aria-pressed", "false");
    await expect(items).toHaveCount(1);
    await expect(main.getByText("1 of 11 projects")).toBeVisible();
    expect(page.url()).toBe(url);
    await main.getByRole("button", { name: "Hackathon" }).click();
    await expect(main.getByRole("article", { name: "DevHacks × Cubbie hackathon" })).toBeVisible();
    await expect(items).toHaveCount(1);
    await all.click();
    await expect(items).toHaveCount(11);
  });

  test("each item is one tab stop: the title link covers it", async ({ page, isMobile }) => {
    test.skip(isMobile, "Keyboard-only check");
    for (const id of ["project-aws-cicd-pipeline", "project-java-group-chat", "project-surplus-ai"]) await expect(page.locator(`#${id}`).getByRole("link")).toHaveCount(1);
    const link = page.locator("#project-aws-cicd-pipeline").getByRole("link", { name: "End-to-End CI/CD Deployment Pipeline" });
    await link.focus();
    await expect(link).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("End-to-End CI/CD Deployment Pipeline");
  });

  test("has no accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "main");
  });

  test("visual", async ({ page }) => {
    await expect(page.locator("main")).toHaveScreenshot("work-index.png", { mask: [page.locator("[data-scene]")] });
  });
});

test.describe("The detail moved to the case study (V5/V6)", () => {
  test("Surplus AI's diagrams, How it works and status live on its page", async ({ page }) => {
    await page.goto("/work/surplus-ai");
    const main = page.locator("main");
    await expect(main.getByRole("img", { name: /Surplus AI pipeline/ })).toBeVisible();
    await expect(main.getByRole("img", { name: /Cluster network/ })).toBeVisible();
    await expect(main.getByRole("img", { name: /Privacy layers/ })).toBeVisible();
    await expect(main.getByRole("term")).toHaveCount(6);
    await expect(main.getByText("Qwen 14B on four Mac minis")).toBeVisible();
    await page.goto("/work/supply-chain-watchtower");
    await expect(page.locator("main").getByRole("img", { name: /Watchtower agent flow/ })).toBeVisible();
  });
});

test.describe("Experience (on /about since V3)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/about");
  });

  test("summarises all four roles and links to the timeline", async ({ page }) => {
    const exp = page.locator("#experience");
    const titles = exp.getByRole("heading", { level: 3 });
    await expect(titles).toHaveText([
      "Tech Assistant, Surplus Operations",
      "Graduate Teaching Assistant",
      "Associate, Data Engineering",
      "Intern, Data Engineering",
    ]);
    for (const title of await titles.allTextContents()) expect(title).not.toMatch(/\b(senior|lead|architect|managed)\b/i);
    await expect(exp.getByRole("link", { name: /on the timeline/ })).toHaveAttribute("href", "/explore#lens=timeline");
    // Full outcomes stay in the static HTML behind a closed disclosure (rule 4, no-JS and crawlers).
    const celebal = exp.locator("li").filter({ has: page.getByRole("heading", { level: 3, name: "Associate, Data Engineering" }) });
    await expect(celebal).toContainText("about 10 million records a day");
    await celebal.getByText("Show all 12 outcomes").click();
    await expect(celebal).toContainText("mentored two interns");
  });

  test("has no accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "#experience");
  });

  test("visual", async ({ page }) => {
    await expect(page.locator("#experience")).toHaveScreenshot("experience.png");
  });
});

test.describe("Skills (on /about since V3)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/about");
  });

  test("summarises every group and links to the skill map", async ({ page }) => {
    const skills = page.locator("#skills");
    await expect(skills.getByRole("heading", { level: 3 })).toHaveText(["Data engineering", "Cloud", "AI and ML", "Governance", "Infrastructure", "BI"]);
    await expect(skills.getByRole("list", { name: "Governance skills" }).getByRole("listitem")).toHaveText([
      "Microsoft Purview",
      "Apache Atlas",
      "Unity Catalog",
      "metadata management",
      "data lineage",
    ]);
    await expect(skills.getByRole("link", { name: /on the skill map/ })).toHaveAttribute("href", "/explore#lens=skills");
    await expect(skills.getByRole("list", { name: "Azure skills" }).getByRole("listitem").first()).toHaveText("Databricks");
    await skills.getByText(/Show all \d+ skills as a list/).click();
    await expect(skills.getByRole("list", { name: "All AWS skills" })).toContainText("CloudWatch");
  });

  test("visual", async ({ page }) => {
    await expect(page.locator("#skills")).toHaveScreenshot("skills.png");
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
