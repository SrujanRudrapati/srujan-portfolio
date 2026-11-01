import { expect, test, type Page } from "@playwright/test";

// V2 motion foundation contract (motion-system), on the real pages since V7 removed /lab:
// the home page (3D hero, pinned reel, count-ups) and a case study (3D cover, scroll-drawn
// diagrams, rail). One project is enough; phone behaviour is covered in e2e/mobile.spec.ts.

const DESKTOPS = ["desktop-light", "webkit-desktop", "firefox-desktop"]; // Chrome, plus Safari and Firefox when CROSS_BROWSER=1
test.beforeEach(({}, info) => test.skip(!DESKTOPS.includes(info.project.name), "one desktop per engine is enough for the motion contract"));

type Counters = { triggers: number; slots: number; canvases: number };
const counters = (page: Page) =>
  page.evaluate(() => {
    const m = (window as unknown as { __motion: { triggers: () => number; slots: () => number; canvases: () => number } }).__motion;
    return { triggers: m.triggers(), slots: m.slots(), canvases: m.canvases() } satisfies Counters;
  });

const HOME_H1 = "Srujan Rudrapati";
const CASE_H1 = "Surplus AI";

async function settle(page: Page, h1: string) {
  await expect(page.locator("main h1")).toHaveText(h1);
  await expect(page.locator("main h1")).toBeFocused();
}

/** Wait until scrolling has stopped (three equal samples), instead of sleeping a fixed time. */
async function scrollSettled(page: Page) {
  let last = -1;
  let same = 0;
  await expect
    .poll(async () => {
      const y = await page.evaluate(() => Math.round(window.scrollY));
      same = y === last ? same + 1 : 0;
      last = y;
      return same;
    }, { intervals: [100], timeout: 10_000 })
    .toBeGreaterThanOrEqual(3);
}

/** Click a link by href with the DOM (it may sit in a pinned reel, off to the side). */
const clickHref = (page: Page, href: string) => page.evaluate((h) => (document.querySelector(`main a[href="${h}"]`) as HTMLAnchorElement).click(), href);
const goHome = (page: Page) => page.getByRole("banner").getByRole("link", { name: HOME_H1 }).click();

test.describe("with motion", () => {
  test.use({ reducedMotion: "no-preference" });

  test("navigating back and forth 10 times leaks no ScrollTriggers, slots or canvases", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/?3d=on&motion-debug", { waitUntil: "networkidle" });
    await page.keyboard.press("Escape"); // skips the intro if it plays
    await page.waitForTimeout(1500);
    const before = await counters(page);
    expect(before.triggers).toBeGreaterThan(0);

    for (let i = 0; i < 10; i++) {
      await clickHref(page, "/work/surplus-ai");
      await settle(page, CASE_H1);
      await goHome(page);
      await settle(page, HOME_H1);
    }
    await page.waitForTimeout(1000);
    const after = await counters(page);
    expect(after.triggers).toBe(before.triggers);
    expect(after.slots).toBe(before.slots);
    expect(after.canvases).toBeLessThanOrEqual(1);
    expect(errors).toEqual([]);
  });

  test("a client navigation lands at the top with focus on the new h1", async ({ page }) => {
    await page.goto("/about", { waitUntil: "networkidle" });
    await page.keyboard.press("Escape");
    await page.mouse.wheel(0, 2500);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500);
    await scrollSettled(page);
    await page.getByRole("banner").getByRole("link", { name: /Work/ }).click();
    await settle(page, "Work");
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5);
  });

  test("a route slower than the transition timeout still lands at the top (DECISIONS 16)", async ({ page }) => {
    // Hold the RSC payloads for 7 s: longer than PageTransitions' 4 s TIMEOUT_MS. Before V7 a timed-out
    // navigation stopped counting as ours, router.push ran with scroll: false, and the page landed mid-scroll.
    // Prefetches before the click are aborted, so the click itself must fetch; from the click on, every
    // payload is held 7 s. The arrival is then asserted to come after TIMEOUT_MS, so the slow path really ran.
    let armed = false;
    await page.route(/\.txt(\?|$)|[?&]_rsc=/, async (route) => {
      if (!armed) return route.abort();
      await new Promise((r) => setTimeout(r, 7000));
      await route.continue();
    });
    await page.goto("/about", { waitUntil: "load" });
    await page.keyboard.press("Escape");
    await page.mouse.wheel(0, 2500);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500);
    await scrollSettled(page);
    armed = true;
    const clicked = Date.now();
    await page.getByRole("banner").getByRole("link", { name: /Work/ }).click();
    await expect(page.locator("main h1")).toHaveText("Work", { timeout: 20_000 });
    expect(Date.now() - clicked).toBeGreaterThan(4000); // TIMEOUT_MS in PageTransitions: the slow path ran
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5);
    await expect(page.locator("main h1")).toBeFocused();
  });

  test("leaving the home page while the reel is pinned throws nothing", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/", { waitUntil: "networkidle" });
    await page.keyboard.press("Escape");
    // Scroll until the reel is pinned (its section gains data-reel="pinned" and sits at the top).
    for (let i = 0; i < 60 && !(await page.locator('[data-reel="pinned"]').evaluate((el) => Math.abs(el.getBoundingClientRect().top) < 2).catch(() => false)); i++) {
      await page.mouse.wheel(0, 400);
      await page.waitForTimeout(120);
    }
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(300);
    await clickHref(page, "/work/surplus-ai");
    await settle(page, CASE_H1);
    expect(errors).toEqual([]);
  });

  test("a link with an #anchor to another page lands on the anchor", async ({ page }) => {
    await page.goto("/work/surplus-ai", { waitUntil: "networkidle" });
    await page.keyboard.press("Escape");
    await page.evaluate(() => {
      const a = document.createElement("a");
      a.href = "/about#experience";
      a.textContent = "to experience";
      document.querySelector("main")!.prepend(a);
      a.click();
    });
    await expect(page.locator("#experience")).toBeFocused();
    await expect.poll(() => page.locator("#experience").evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBeLessThan(200);
  });

  test("the intro plays once per session and any key skips it", async ({ page }) => {
    // Record whether <html data-intro> was ever set (the intro is short; under load it can end before an assertion polls).
    await page.addInitScript(() => {
      const w = window as unknown as { __introSeen: boolean };
      w.__introSeen = false;
      new MutationObserver(() => {
        if (document.documentElement.hasAttribute("data-intro")) w.__introSeen = true;
      }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-intro"] });
    });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    expect(await page.evaluate(() => (window as unknown as { __introSeen: boolean }).__introSeen || document.documentElement.hasAttribute("data-intro"))).toBe(true);
    await page.keyboard.press("Space");
    await expect(page.locator("html")).not.toHaveAttribute("data-intro", "", { timeout: 500 });
    await page.reload({ waitUntil: "domcontentloaded" });
    expect(await page.evaluate(() => (window as unknown as { __introSeen: boolean }).__introSeen || document.documentElement.hasAttribute("data-intro"))).toBe(false);
  });

  test("keyboard scrolling still works with smooth scroll on", async ({ page }) => {
    await page.goto("/about", { waitUntil: "networkidle" });
    await page.keyboard.press("Escape");
    await expect(page.locator("html")).toHaveClass(/lenis/);
    await page.locator("body").click({ position: { x: 5, y: 5 } });
    await page.keyboard.press("PageDown");
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(300);
  });
});

test("reduced motion: no smooth scroll, no pins, no intro, real figures in place", async ({ page, request }) => {
  const html = await (await request.get("/")).text();
  expect(html).toContain("~80%"); // count-ups ship their real value in the HTML
  await page.goto("/?motion-debug", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await expect(page.locator("html")).not.toHaveClass(/lenis/);
  await expect(page.locator("html")).not.toHaveAttribute("data-intro", "");
  await expect(page.locator('[data-reel="pinned"]')).toHaveCount(0);
  const counts = await counters(page);
  expect(counts.triggers).toBe(0);
  expect(counts.canvases).toBe(0);
  await expect(page.locator("[data-count]").first()).toHaveText(/\d/);
});
