import { expect, test, type Page } from "@playwright/test";
import { expectNoA11yViolations, openExplore } from "./helpers";

test.beforeEach(async ({ page, javaScriptEnabled }) => openExplore(page, undefined, javaScriptEnabled));

// Runbook Phase 7: the Work section's lens switcher.
test.describe("Lenses", () => {
  const switcher = (page: Page) => page.getByRole("group", { name: "View work as" });

  test("Highlights is the default and the switcher is real buttons with aria-pressed", async ({ page }) => {
    const buttons = switcher(page).getByRole("button");
    await expect(buttons).toHaveText(["Highlights", "Timeline", "Skill map", "By problem", "By industry", "Recruiter"]);
    await expect(switcher(page).getByRole("button", { name: "Highlights" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#project-surplus-ai")).toBeVisible();
  });

  test("a lens click updates the hash, arrow keys move between lenses", async ({ page }) => {
    const timeline = switcher(page).getByRole("button", { name: "Timeline" });
    await timeline.click();
    await expect(page).toHaveURL(/#lens=timeline$/);
    await expect(timeline).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#project-surplus-ai")).toBeHidden();

    // Keyboard users arrive by Tab, so focus is on the button. (Safari on macOS does not focus a button on
    // mouse click, by platform design, so the click above alone would leave focus elsewhere there.)
    await timeline.focus();
    await page.keyboard.press("ArrowRight");
    const skills = switcher(page).getByRole("button", { name: "Skill map" });
    await expect(skills).toBeFocused();
    await expect(skills).toHaveAttribute("aria-pressed", "true");
    await expect(page).toHaveURL(/#lens=skills$/);

    await page.keyboard.press("Home");
    await expect(switcher(page).getByRole("button", { name: "Highlights" })).toHaveAttribute("aria-pressed", "true");
    await expect(page).not.toHaveURL(/#lens=/);
  });

  test("Timeline carries every role outcome and nests projects under their role", async ({ page }) => {
    await page.goto("/explore#lens=timeline");
    const work = page.locator("#work");
    await expect(work.getByRole("heading", { level: 3 }).first()).toHaveText("Tech Assistant, Surplus Operations");
    const celebal = work.locator("li").filter({ has: page.getByRole("heading", { level: 3, name: "Associate, Data Engineering" }) });
    await expect(celebal.locator("dt")).toHaveCount(12);
    await expect(celebal).toContainText("Time-to-insight dropped about 50%");
    await expect(celebal).toContainText("Cut downtime about 30%");
    await expect(celebal).toContainText("on call for it");
    await expect(celebal).toContainText("mentored two interns");
    await expect(work.getByRole("list", { name: "Projects during Graduate Teaching Assistant" })).toContainText("WLAN Traffic Forensics Toolkit");
    await expect(work.locator("time").first()).toHaveAttribute("datetime", /^\d{4}/);
  });

  test("Skill map counts usage and filters the list beneath", async ({ page }) => {
    await page.goto("/explore#lens=skills");
    const work = page.locator("#work");
    await expect(work.getByRole("heading", { name: "All projects" })).toBeVisible();
    const python = work.getByRole("button", { name: /^Python/ });
    await python.click();
    await expect(python).toHaveAttribute("aria-pressed", "true");
    await expect(work.getByRole("heading", { name: "Where Python is used" })).toBeVisible();
    await expect(work.getByRole("list", { name: "Projects and roles using Python" }).getByRole("listitem")).toHaveCount(4);
    await work.getByRole("button", { name: "Show all projects" }).click();
    await expect(work.getByRole("list", { name: "All projects" }).getByRole("listitem")).toHaveCount(11);
  });

  test("By problem and By industry key cards on graph nodes", async ({ page }) => {
    await page.goto("/explore#lens=problems");
    await expect(page.getByRole("list", { name: "Work by problem solved" }).getByRole("heading", { level: 3, name: "Ungrounded AI output" })).toBeVisible();
    await page.goto("/explore#lens=industries");
    await expect(page.getByRole("list", { name: "Work by industry" }).getByRole("heading", { level: 3, name: "E-commerce" })).toBeVisible();
  });

  test("a project link from a lens opens the project's page (V3)", async ({ page }) => {
    await page.goto("/explore#lens=recruiter");
    await page.locator("#recruiter-sheet").getByRole("link", { name: "Label Lens" }).click();
    await expect(page).toHaveURL(/\/work\/label-lens$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Label Lens");
  });

  test("Recruiter mode prints on one page", async ({ page, isMobile, browserName }) => {
    test.skip(isMobile, "PDF output is the same at any viewport");
    test.skip(browserName !== "chromium", "page.pdf() is Chromium-only in Playwright");
    await page.goto("/explore#lens=recruiter");
    await expect(page.locator("#recruiter-sheet")).toContainText("rudrapati.srujan@gmail.com");
    for (const format of ["Letter", "A4"] as const) {
      const pdf = await page.pdf({ format, printBackground: true });
      expect(pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g)?.length, format).toBe(1);
    }
  });

  test("summary links open the right lens on /explore (v4: the About skill map link)", async ({ page }) => {
    await page.goto("/about");
    await page.getByRole("link", { name: /on the skill map/ }).click();
    await expect(page).toHaveURL(/\/explore#lens=skills$/);
    await expect(switcher(page).getByRole("button", { name: "Skill map" })).toHaveAttribute("aria-pressed", "true");
  });

  test("/cv prints the one-pager on one page", async ({ page, isMobile, browserName }) => {
    test.skip(isMobile, "PDF output is the same at any viewport");
    test.skip(browserName !== "chromium", "page.pdf() is Chromium-only in Playwright");
    await page.goto("/cv");
    await expect(page.locator("#recruiter-sheet")).toContainText("rudrapati.srujan@gmail.com");
    for (const format of ["Letter", "A4"] as const) {
      const pdf = await page.pdf({ format, printBackground: true });
      expect(pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g)?.length, format).toBe(1);
    }
  });

  test.describe("printing with a dark system theme", () => {
    test.use({ colorScheme: "dark" });

    test("Recruiter mode prints dark text on white", async ({ page, isMobile }) => {
      test.skip(isMobile, "Desktop only");
      await page.goto("/explore#lens=recruiter");
      await expect(page.locator("#recruiter-sheet")).toBeVisible();
      await page.emulateMedia({ media: "print", colorScheme: "dark" });
      // The theme colour fade transitions the switch, so poll until it settles.
      await expect
        .poll(() => page.locator("#recruiter-sheet p").first().evaluate((el) => ({ text: getComputedStyle(el).color, bg: getComputedStyle(document.body).backgroundColor })))
        .toEqual({ text: "rgb(0, 0, 0)", bg: "rgb(255, 255, 255)" });
    });
  });

  test("one h1 in every lens, and no accessibility violations", async ({ page }) => {
    for (const lens of ["highlights", "timeline", "skills", "problems", "industries", "recruiter"]) {
      await page.goto(lens === "highlights" ? "/explore" : `/explore#lens=${lens}`);
      await expect(page.locator("#work [data-lens-panel]:not([hidden])").first()).toBeVisible();
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Explore");
      await expectNoA11yViolations(page, "#work");
    }
  });

  test("a failed graph.json load offers a retry that recovers", async ({ page }) => {
    let fail = true;
    await page.route("**/graph.json", (route) => (fail ? route.abort() : route.continue()));
    await switcher(page).getByRole("button", { name: "Timeline" }).click();
    await expect(page.getByText("This view could not load.")).toBeVisible();
    fail = false;
    await page.getByRole("button", { name: "try again" }).click();
    await expect(page.locator("#work").getByRole("heading", { level: 3 }).first()).toHaveText("Tech Assistant, Surplus Operations");
  });

  test.describe("without JavaScript", () => {
    test.use({ javaScriptEnabled: false });

    test("the default lens is complete static HTML", async ({ page }) => {
      await expect(page.locator('#work [id^="project-"]')).toHaveCount(11); // 4 featured + 7 rows (V6)
      await expect(page.locator("#project-surplus-ai")).toBeVisible();
    });
  });
});
