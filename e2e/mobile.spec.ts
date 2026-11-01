import { expect, test, type Page } from "@playwright/test";
import { expectNoA11yViolations } from "./helpers";

// Runbook V7, mobile at 390 and 360 with real touch emulation (the mobile-dark project is a
// Pixel 7: hasTouch, isMobile): no pinned sequence that traps the thumb, reels as native swipes
// with snap, no custom cursor, tap targets at least 44 px, the palette from a visible button.

test.beforeEach(({}, info) => test.skip(!["mobile-dark", "webkit-mobile"].includes(info.project.name), "phones only"));

const ROUTES = ["/", "/work", "/work/surplus-ai", "/work/devhacks-cubbie", "/work/f1-race-predictor", "/explore", "/about", "/cv", "/no-such-page"];
const WIDTHS = [390, 360];

/** Interactive elements under 44 px either way, except inline text links inside sentences (WCAG 2.5.8 exception). */
const smallTargets = (page: Page) =>
  page.evaluate(() => {
    const out: string[] = [];
    for (const el of document.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, summary, [role="button"], [tabindex="0"]')) {
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden" || el.closest("[hidden], dialog:not([open]), .sr-only")) continue;
      if (cs.display === "inline" && el.tagName === "A") continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.width < 43.5 || r.height < 43.5) out.push(`${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 40)}" ${Math.round(r.width)}x${Math.round(r.height)}`);
    }
    return out;
  });

test.describe("a short phone (390 x 664, an iPhone 14 under Safari's bars)", () => {
  test.use({ viewport: { width: 390, height: 664 } });
  test("name, line, current role, proof figure, buttons and email are all on the first screen", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const hero = page.locator('[data-stage="ingest"]');
    for (const el of [hero.getByRole("heading", { level: 1 }), hero.getByText("I build the data layer"), hero.getByText(/^Tech Assistant/), hero.getByText("~80%"), hero.getByRole("link", { name: "See my work" }), hero.getByRole("link", { name: /@/ })]) {
      await expect(el).toBeVisible();
      const box = (await el.boundingBox())!;
      expect(box.y + box.height).toBeLessThanOrEqual(664);
    }
  });
});

for (const width of WIDTHS) {
  test.describe(`at ${width} px`, () => {
    test.use({ viewport: { width, height: 800 } });

    test("every route: tap targets at least 44 px, no sideways scroll, nothing pinned", async ({ page }) => {
      for (const path of ROUTES) {
        await page.goto(path, { waitUntil: "networkidle" });
        expect(await smallTargets(page), path).toEqual([]);
        expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), path).toBe(0);
        await expect(page.locator('[data-reel="pinned"]'), path).toHaveCount(0);
      }
    });

    test.describe("with motion", () => {
      test.use({ reducedMotion: "no-preference" });

      test("the home reel is a native swipe with snap, and scrolling never gets trapped", async ({ page }) => {
        await page.goto("/", { waitUntil: "networkidle" });
        const track = page.getByRole("list", { name: /Selected work/ });
        await track.scrollIntoViewIfNeeded();
        const info = await track.evaluate((el) => ({ snap: getComputedStyle(el).scrollSnapType, overflow: getComputedStyle(el).overflowX, wider: el.scrollWidth > el.clientWidth }));
        expect(info.snap).toContain("x");
        expect(["auto", "scroll"]).toContain(info.overflow);
        expect(info.wider).toBe(true);
        // A sideways swipe moves the track; a vertical scroll moves the page past it (no pin holds the thumb).
        await track.evaluate((el) => el.scrollBy({ left: el.clientWidth, behavior: "instant" }));
        await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
        const y = await page.evaluate(() => window.scrollY);
        await page.evaluate(() => window.scrollBy(0, 1200));
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(y + 600);
        // With motion on and the reel scrolled past, nothing is pinned on a phone (the every-route check runs reduced).
        await expect(page.locator('[data-reel="pinned"], .pin-spacer')).toHaveCount(0);
      });

      test("no custom cursor on touch", async ({ page }) => {
        await page.goto("/", { waitUntil: "networkidle" });
        await page.touchscreen.tap(200, 400);
        const rings = page.locator('[class*="_cursor"]');
        expect(await rings.count()).toBeGreaterThan(0); // the ring is in the DOM everywhere; on touch it must stay hidden
        for (const ring of await rings.all()) await expect(ring).toBeHidden();
      });
    });

    test("the command palette opens from the visible Menu button and closes back to it", async ({ page }) => {
      await page.goto("/", { waitUntil: "networkidle" });
      const menu = page.getByRole("banner").getByRole("button", { name: /Menu/ });
      await expect(menu).toBeVisible();
      await menu.tap();
      const palette = page.getByRole("dialog", { name: "Command palette" });
      await expect(palette).toBeVisible();
      await expectNoA11yViolations(page, "dialog");
      await page.keyboard.press("Escape");
      await expect(palette).toBeHidden();
      await expect(menu).toBeFocused();
    });
  });
}
