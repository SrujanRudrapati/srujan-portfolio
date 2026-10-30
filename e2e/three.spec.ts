import { expect, test, type Page } from "@playwright/test";

// The 3D layer's fallback contract (motion-system, runbook V1.5): posters first,
// one shared canvas, posters only under reduced motion, with ?3d=off, and after a
// lost WebGL context. Runs once (desktop-light) against the static export.

test.beforeEach(({}, info) => test.skip(info.project.name !== "desktop-light", "one project is enough for the 3D contract"));

const PAGE = "/lab/a";

async function postersVisible(page: Page) {
  const scenes = page.locator("[data-scene]");
  await expect(scenes).toHaveCount(3);
  for (const img of await page.locator("[data-scene] img").all()) {
    await expect(img).toHaveCSS("opacity", "1");
    expect(await img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  }
}

test("reduced motion shows every poster and never creates a canvas", async ({ page }) => {
  await page.goto(PAGE, { waitUntil: "networkidle" });
  for (const img of await page.locator("[data-scene] img").all()) await img.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2500);
  await expect(page.locator("canvas")).toHaveCount(0);
  await postersVisible(page);
});

test.describe("with motion", () => {
  test.use({ reducedMotion: "no-preference" });

  test("?3d=off keeps posters only", async ({ page }) => {
    await page.goto(`${PAGE}?3d=off`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2500);
    await expect(page.locator("canvas")).toHaveCount(0);
  });

  test("one shared canvas draws the live scenes, and a lost context falls back to posters", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`${PAGE}?3d=on`, { waitUntil: "networkidle" });
    await expect(page.locator('[data-scene="hero-stream"][data-live]')).toHaveCount(1, { timeout: 20_000 });
    await expect(page.locator("canvas")).toHaveCount(1);

    await page.locator("canvas").evaluate((c: HTMLCanvasElement) => c.getContext("webgl2")?.getExtension("WEBGL_lose_context")?.loseContext());
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.locator("[data-live]")).toHaveCount(0);
    await expect(page.locator('[data-scene="hero-stream"] img')).toHaveCSS("opacity", "1");
    expect(errors).toEqual([]);
  });
});
