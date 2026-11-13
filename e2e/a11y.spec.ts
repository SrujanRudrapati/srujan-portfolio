import { expect, test } from "@playwright/test";
import { hero } from "../src/data/home";
import { projects } from "../src/data/projects";
import { expectNoA11yViolations, openHome } from "./helpers";

// Runbook V7, accessibility: axe on every route and lens, a keyboard pass with a visible focus
// indicator on every stop, and split text that screen readers hear as plain sentences.

const ROUTES = ["/", "/work", ...projects.map((p) => `/work/${p.slug}`), "/about", "/cv", "/no-such-page"];
const LENSES = ["highlights", "timeline", "skills", "problems", "industries", "recruiter"];

test.describe("axe: zero violations", () => {
  test("every route", async ({ page }) => {
    test.setTimeout(120_000);
    for (const path of ROUTES) {
      await page.goto(path, { waitUntil: "networkidle" });
      await expectNoA11yViolations(page);
    }
  });

  test("every lens on /explore", async ({ page }) => {
    for (const lens of LENSES) {
      await page.goto(`/explore#lens=${lens}`, { waitUntil: "networkidle" });
      await expect(page.locator("html[data-lens]")).toHaveAttribute("data-lens", lens);
      await expectNoA11yViolations(page);
    }
  });
});

test.describe("keyboard", () => {
  test("every Tab stop on the home page shows a focus indicator", async ({ page, isMobile, browserName }) => {
    test.skip(isMobile, "Keyboard pass on desktop");
    await openHome(page);
    const key = browserName === "webkit" ? "Alt+Tab" : "Tab";
    const seen = new Set<string>();
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press(key);
      const stop = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const cs = getComputedStyle(el);
        const ring = (cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== "none";
        // A stretched link draws its ring on the item that holds it (:has(:focus-visible)); the home Ask box
        // draws it on its form (:focus-within), around the input and the button together.
        const holder = el.closest("article, li, form");
        const held = !!holder && getComputedStyle(holder).outlineStyle !== "none";
        return { id: `${el.tagName}:${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 40)}`, ring: ring || held };
      });
      if (!stop || seen.has(stop.id)) continue;
      seen.add(stop.id);
      expect(stop.ring, stop.id).toBe(true);
    }
    // v5 home: skip link, nav (SR, Projects, Contact, Ask), the cue and the project links and demos.
    expect(seen.size).toBeGreaterThanOrEqual(10);
  });
});

test.describe("home headline with motion", () => {
  test.use({ reducedMotion: "no-preference" });
  test("screen readers hear the headline once, as one plain sentence", async ({ page }) => {
    await openHome(page);
    await expect(page.locator("main h1")).toHaveAccessibleName(hero.headline);
    const snapshot = await page.locator("main").ariaSnapshot();
    expect(snapshot.split("I build cloud data pipelines").length - 1).toBe(1);
    // The giant name is decoration (aria-hidden); its letters are never read one by one.
    expect(snapshot).not.toMatch(/- text: S\n\s*- text: R/);
  });
});

test.describe("dialogs", () => {
  test("the game dialog and the Ask panel have no violations", async ({ page }) => {
    await openHome(page);
    await page.keyboard.press("ControlOrMeta+k");
    await page.keyboard.type("game");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog", { name: "Clean the pipeline" })).toBeVisible();
    await expectNoA11yViolations(page, "dialog[open]");
    await page.keyboard.press("Escape");
    await page.keyboard.press("ControlOrMeta+k");
    await page.keyboard.type("what runs in production");
    await page.getByRole("dialog", { name: "Command palette" }).getByRole("option").last().click();
    await expect(page.getByRole("dialog", { name: "Ask about my work" }).getByRole("list", { name: "Evidence" })).toBeVisible();
    await expectNoA11yViolations(page, "dialog[open]");
  });
});
