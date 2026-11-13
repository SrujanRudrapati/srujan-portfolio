import { expect, test, type Page } from "@playwright/test";

// Mobile at 390 and 360 with real touch emulation (the mobile-dark project is a Pixel 7: hasTouch,
// isMobile): tap targets at least 44 px on every route, no sideways scroll, nothing pinned, no custom
// cursor. (v4 W7: the v3 phone hero, reel and Menu button are gone; the hub's phone layout is in v4-home.)

test.beforeEach(({}, info) => test.skip(!["mobile-dark", "webkit-mobile"].includes(info.project.name), "phones only"));

const ROUTES = ["/", "/work", "/work/surplus-station", "/work/devhacks-cubbie", "/work/f1-race-predictor", "/experience", "/about", "/contact", "/explore", "/cv", "/no-such-page"];
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

      test("no custom cursor on touch", async ({ page }) => {
        await page.goto("/", { waitUntil: "networkidle" });
        await page.touchscreen.tap(200, 400);
        const rings = page.locator('[class*="_cursor"]');
        expect(await rings.count()).toBeGreaterThan(0); // the ring is in the DOM everywhere; on touch it must stay hidden
        for (const ring of await rings.all()) await expect(ring).toBeHidden();
      });
    });

  });
}
