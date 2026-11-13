import { expect, test, type Page } from "@playwright/test";
import { projects } from "../src/data/projects";

// v5 fit check (the brief's "done means"): at 360, 390, 768 and 1440 px, no text overflows its
// container or the screen, and the page never scrolls sideways.
//
// Sideways scroll is measured with the html/body `overflow-x: clip` lifted, so real overflow cannot
// hide behind it. Sections keep their own clip: their ghosts and edge pins are meant to bleed past
// the heading, and the clip is what keeps them from widening the page.

const WIDTHS = [360, 390, 768, 1440];
const HOME = ["/"];
const ROUTES = ["/", "/work", ...projects.map((p) => `/work/${p.slug}`), "/experience", "/about", "/contact", "/explore", "/cv"];

type Overflow = { what: string; text: string; by: number };

async function settle(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  const thread = page.locator("svg[data-thread]");
  if (await thread.count()) await expect(thread).toHaveAttribute("data-ready", "");
  // Two frames, so a rebuild after fonts load has run.
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
}

async function sidewaysScroll(page: Page): Promise<number> {
  return page.evaluate(() => {
    const els = [document.documentElement, document.body];
    const old = els.map((e) => e.style.overflowX);
    els.forEach((e) => (e.style.overflowX = "visible"));
    const over = document.documentElement.scrollWidth - innerWidth;
    els.forEach((e, i) => (e.style.overflowX = old[i]));
    return over;
  });
}

/**
 * Every visible run of text, measured as text (a Range over the text node), so decoration such as
 * the hand-drawn ring around a figure does not count. A run must sit inside the screen, inside the
 * element that holds it, and inside that element's parent. Each giant heading line must also fit
 * its heading.
 */
async function textOverflows(page: Page): Promise<Overflow[]> {
  return page.evaluate(() => {
    const SLACK = 1;
    const out: { what: string; text: string; by: number }[] = [];
    const name = (el: Element) => `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}${typeof el.className === "string" && el.className ? `.${el.className.split(" ")[0]}` : ""}`;
    const inner = (el: Element) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return { left: r.left + parseFloat(cs.borderLeftWidth), right: r.right - parseFloat(cs.borderRightWidth) };
    };
    const scrolls = (el: Element) => /(auto|scroll)/.test(getComputedStyle(el).overflowX);
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const el = node.parentElement;
      if (!el || !node.textContent!.trim()) continue;
      if (el.closest("svg, script, style, .sr-only, dialog:not([open]), [hidden]")) continue;
      if (getComputedStyle(el).visibility === "hidden") continue;
      range.selectNodeContents(node);
      const r = range.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const text = node.textContent!.trim().slice(0, 40);
      const screen = Math.max(r.right - innerWidth, -r.left);
      if (screen > SLACK) out.push({ what: `${name(el)} past the screen`, text, by: Math.round(screen) });
      for (const box of [el, el.parentElement]) {
        if (!box || box === document.body || scrolls(box)) continue;
        const b = inner(box);
        const by = Math.max(r.right - b.right, b.left - r.left);
        if (by > SLACK) out.push({ what: `text past ${name(box)}`, text, by: Math.round(by) });
      }
    }
    for (const line of document.querySelectorAll("[data-gl]")) {
      const g = line.closest("[data-giant]")!;
      const r = line.getBoundingClientRect();
      const b = inner(g);
      const by = Math.max(r.right - b.right, b.left - r.left);
      if (by > SLACK) out.push({ what: "giant line past its heading", text: line.textContent!, by: Math.round(by) });
    }
    return out;
  });
}

for (const width of WIDTHS) {
  test.describe(`${width}px`, () => {
    test.use({ viewport: { width, height: width >= 1024 ? 900 : 844 } });

    test("no text overflows its container or the screen on the home page", async ({ page }) => {
      for (const path of HOME) {
        await page.goto(path);
        await settle(page);
        expect(await textOverflows(page), path).toEqual([]);
      }
    });

    test("every spread drawing fits its spread and the screen", async ({ page }) => {
      await page.goto("/");
      await settle(page);
      const bad = await page.evaluate(() =>
        [...document.querySelectorAll("main figure")].flatMap((fig) => {
          const r = fig.getBoundingClientRect();
          const spread = fig.parentElement!.parentElement!.getBoundingClientRect();
          const caption = fig.querySelector("figcaption")!.textContent!;
          const issues: string[] = [];
          if (r.width < 40) issues.push(`${caption}: only ${Math.round(r.width)}px wide`);
          if (r.left < -1 || r.right > innerWidth + 1) issues.push(`${caption}: past the screen`);
          if (r.left < spread.left - 1 || r.right > spread.right + 1) issues.push(`${caption}: past its spread`);
          return issues;
        }),
      );
      expect(bad).toEqual([]);
    });

    test("the thread passes between the spread's columns, never through a drawing or its caption", async ({ page }) => {
      await page.goto("/");
      await settle(page);
      const crossed = await page.evaluate(() => {
        const line = document.querySelectorAll<SVGPathElement>("svg[data-thread] > path")[2];
        const box = line.ownerSVGElement!.getBoundingClientRect();
        const total = line.getTotalLength();
        const pts: { x: number; y: number }[] = [];
        for (let l = 0; l <= total; l += 4) {
          const p = line.getPointAtLength(l);
          pts.push({ x: p.x + box.left, y: p.y + box.top });
        }
        const INSET = 2;
        return [...document.querySelectorAll("main figure")]
          .filter((fig) => {
            const r = fig.getBoundingClientRect();
            return pts.some((p) => p.x > r.left + INSET && p.x < r.right - INSET && p.y > r.top + INSET && p.y < r.bottom - INSET);
          })
          .map((fig) => fig.querySelector("figcaption")!.textContent);
      });
      expect(crossed).toEqual([]);
    });

    test("no page scrolls sideways", async ({ page }) => {
      test.setTimeout(120_000);
      for (const path of ROUTES) {
        await page.goto(path);
        await settle(page);
        expect(await sidewaysScroll(page), path).toBeLessThanOrEqual(0);
      }
    });
  });
}
