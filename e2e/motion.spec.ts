import { expect, test, type Page } from "@playwright/test";

// V2 motion foundation contract (motion-system), on /lab/motion and /lab/motion/next.
// One project is enough; mobile behaviour of the reel and pins is covered in V7.

test.beforeEach(({}, info) => test.skip(info.project.name !== "desktop-light", "one project is enough for the motion contract"));

type Counters = { triggers: number; slots: number; canvases: number };
const counters = (page: Page) =>
  page.evaluate(() => {
    const m = (window as unknown as { __motion: { triggers: () => number; slots: () => number; canvases: () => number } }).__motion;
    return { triggers: m.triggers(), slots: m.slots(), canvases: m.canvases() } satisfies Counters;
  });

async function settle(page: Page, h1: string) {
  await expect(page.locator("main h1")).toHaveText(h1);
  await expect(page.locator("main h1")).toBeFocused();
  await page.waitForTimeout(400);
}

test.describe("with motion", () => {
  test.use({ reducedMotion: "no-preference" });

  test("navigating back and forth 10 times leaks no ScrollTriggers, slots or canvases", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/lab/motion?3d=on&motion-debug", { waitUntil: "networkidle" });
    await page.keyboard.press("Escape"); // skips the intro if it plays
    await page.waitForTimeout(1500);
    const before = await counters(page);
    expect(before.triggers).toBeGreaterThan(0);

    for (let i = 0; i < 10; i++) {
      await page.getByRole("link", { name: "Next page" }).first().click();
      await settle(page, "Page two");
      await page.getByRole("link", { name: "Back to the primitives" }).click();
      await settle(page, "Motion primitives");
    }
    await page.waitForTimeout(1000);
    const after = await counters(page);
    expect(after.triggers).toBe(before.triggers);
    expect(after.slots).toBe(before.slots);
    expect(after.canvases).toBeLessThanOrEqual(1);
    expect(errors).toEqual([]);
  });

  test("a client navigation lands at the top with focus on the new h1", async ({ page }) => {
    await page.goto("/lab/motion", { waitUntil: "networkidle" });
    await page.keyboard.press("Escape");
    await page.mouse.wheel(0, 2500);
    await page.waitForTimeout(800);
    await page.getByRole("link", { name: "Next page" }).last().click();
    await settle(page, "Page two");
    expect(await page.evaluate(() => window.scrollY)).toBeLessThan(5);
  });

  test("leaving a page while a section is pinned throws nothing", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/lab/motion", { waitUntil: "networkidle" });
    await page.keyboard.press("Escape");
    // Scroll until the reel is pinned (its section gains data-reel="pinned" and sits at the top).
    for (let i = 0; i < 40 && !(await page.locator('[data-reel="pinned"]').evaluate((el) => Math.abs(el.getBoundingClientRect().top) < 2).catch(() => false)); i++) {
      await page.mouse.wheel(0, 400);
      await page.waitForTimeout(120);
    }
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(300);
    await page.evaluate(() => (document.querySelector('a[href$="/lab/motion/next"]') as HTMLAnchorElement).click());
    await settle(page, "Page two");
    expect(errors).toEqual([]);
  });

  test("a link with an #anchor to another page lands on the anchor", async ({ page }) => {
    await page.goto("/lab/motion/next", { waitUntil: "networkidle" });
    await page.keyboard.press("Escape");
    await page.evaluate(() => {
      const a = document.createElement("a");
      a.href = "/lab/motion#count-h";
      a.textContent = "to figures";
      document.querySelector("main")!.prepend(a);
      a.click();
    });
    await expect(page.locator("#count-h")).toBeFocused();
    const tops: number[] = [];
    for (let i = 0; i < 6; i++) {
      tops.push(await page.locator("#count-h").evaluate((el) => Math.round(el.getBoundingClientRect().top)));
      await page.waitForTimeout(250);
    }
    expect(tops.at(-1)!).toBeLessThan(200);
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
    await page.goto("/lab/motion", { waitUntil: "domcontentloaded" });
    expect(await page.evaluate(() => (window as unknown as { __introSeen: boolean }).__introSeen || document.documentElement.hasAttribute("data-intro"))).toBe(true);
    await page.keyboard.press("Space");
    await expect(page.locator("html")).not.toHaveAttribute("data-intro", "", { timeout: 500 });
    await page.reload({ waitUntil: "domcontentloaded" });
    expect(await page.evaluate(() => (window as unknown as { __introSeen: boolean }).__introSeen || document.documentElement.hasAttribute("data-intro"))).toBe(false);
  });

  test("keyboard scrolling still works with smooth scroll on", async ({ page }) => {
    await page.goto("/lab/motion", { waitUntil: "networkidle" });
    await page.keyboard.press("Escape");
    await expect(page.locator("html")).toHaveClass(/lenis/);
    await page.locator("body").click({ position: { x: 5, y: 5 } });
    await page.keyboard.press("PageDown");
    await page.waitForTimeout(800);
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(300);
  });
});

test("reduced motion: no smooth scroll, no pins, no intro, real figures in place", async ({ page, request }) => {
  const html = await (await request.get("/lab/motion")).text();
  expect(html).toContain("~80%"); // count-ups ship their real value in the HTML
  await page.goto("/lab/motion?motion-debug", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await expect(page.locator("html")).not.toHaveClass(/lenis/);
  await expect(page.locator("html")).not.toHaveAttribute("data-intro", "");
  const counts = await counters(page);
  expect(counts.triggers).toBe(0);
  expect(counts.canvases).toBe(0);
  await expect(page.locator("[data-count]").first()).toHaveText(/\d/);
});
