import { expect, test } from "@playwright/test";

// Runbook Phase 9: mobile widths and targets, touch flows, motion gating, metadata.

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
});

test.describe("Mobile, touch and motion (Phase 9)", () => {
  for (const width of [360, 390, 414, 768, 1024]) {
    test(`${width}px: no horizontal scroll, controls at least 44px tall`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const result = await page.evaluate(() => {
        const small: string[] = [];
        for (const el of document.querySelectorAll<HTMLElement>("a[href], button, input, summary")) {
          const s = getComputedStyle(el);
          if (s.display === "none" || s.visibility === "hidden" || el.closest("[hidden], dialog:not([open]), .sr-only")) continue;
          const b = el.getBoundingClientRect();
          if (b.width === 0 || b.height === 0) continue;
          // Links inside running text are exempt (WCAG 2.5.8 inline exception).
          const inline = el.tagName === "A" && s.display === "inline" && (el.parentElement?.textContent ?? "").trim().length > (el.textContent ?? "").trim().length + 10;
          if (!inline && b.height < 44) small.push(`${el.tagName} "${(el.textContent ?? "").trim().slice(0, 30)}" ${Math.round(b.height)}px`);
        }
        return { overflow: document.documentElement.scrollWidth - window.innerWidth, small };
      });
      expect(result.overflow).toBeLessThanOrEqual(0);
      expect(result.small).toEqual([]);
    });
  }

  test("390px: hero diagram text renders at 12px or more", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const smallest = await page.locator("#top .medallion").evaluate((svg) => {
      const scale = svg.getBoundingClientRect().width / (svg as SVGSVGElement).viewBox.baseVal.width;
      return Math.min(...Array.from(svg.querySelectorAll("text")).filter((t) => getComputedStyle(t).display !== "none").map((t) => parseFloat(getComputedStyle(t).fontSize) * scale));
    });
    expect(smallest).toBeGreaterThanOrEqual(12);
  });

  for (const where of ["ask", "skills"] as const) {
    test(`controls in the ${where === "ask" ? "open Ask panel" : "Skill map"} are at least 44px tall`, async ({ page }) => {
      if (where === "ask") {
        await page.locator("#hero-ask").fill("What have you done with Spark?");
        await page.keyboard.press("Enter");
        await expect(page.getByRole("dialog").getByRole("list", { name: "Evidence" })).toBeVisible();
      } else {
        await page.goto("/#lens=skills");
        await expect(page.getByRole("heading", { name: "All projects" })).toBeVisible();
      }
      const scope = where === "ask" ? "dialog[open]" : "#work";
      const small = await page.evaluate((sel) => {
        const out: string[] = [];
        for (const el of document.querySelectorAll<HTMLElement>(`${sel} a[href], ${sel} button, ${sel} input`)) {
          const s = getComputedStyle(el);
          if (s.display === "none" || el.closest("[hidden], .sr-only")) continue;
          const b = el.getBoundingClientRect();
          const inline = el.tagName === "A" && s.display === "inline";
          if (!inline && b.height > 0 && b.height < 44) out.push(`${(el.textContent ?? "").trim().slice(0, 30)} ${Math.round(b.height)}px`);
        }
        return out;
      }, scope);
      expect(small).toEqual([]);
    });
  }

  test("touch: theme toggle, menu, lens switcher and Ask work by tap", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Touch device project");
    await page.getByRole("button", { name: "Open menu" }).tap();
    const before = await page.locator("html").getAttribute("data-theme");
    await page.locator("#mobile-menu").getByRole("button", { name: /theme/ }).tap();
    await expect(page.locator("html")).not.toHaveAttribute("data-theme", before ?? "");
    await page.locator("#mobile-menu").getByRole("link", { name: "Work" }).tap();
    await page.getByRole("group", { name: "View work as" }).getByRole("button", { name: "Timeline" }).tap();
    await expect(page.getByRole("group", { name: "View work as" }).getByRole("button", { name: "Timeline" })).toHaveAttribute("aria-pressed", "true");
    await page.locator("#hero-ask").scrollIntoViewIfNeeded();
    await page.locator("#hero-ask").tap();
    await page.locator("#hero-ask").fill("What runs in production?");
    await page.getByRole("search", { name: "Ask about my work" }).getByRole("button", { name: "Ask" }).tap();
    await expect(page.getByRole("dialog", { name: "Ask about my work" }).getByRole("list", { name: "Evidence" })).toBeVisible();
  });

  test("reduced motion: the hero diagram is lit and still", async ({ page }) => {
    const state = await page.locator("#top .medallion").evaluate((svg) => ({
      dot: getComputedStyle(svg.querySelector(".medallion-dot")!).display,
      lit: getComputedStyle(svg.querySelector(".medallion-lit")!).opacity,
      animation: getComputedStyle(svg.querySelector(".medallion-lit")!).animationName,
    }));
    expect(state).toEqual({ dot: "none", lit: "1", animation: "none" });
  });

  test.describe("with motion allowed", () => {
    test.use({ reducedMotion: "no-preference" });

    test("the hero diagram loops only while on screen, and only with opacity and offset", async ({ page }) => {
      const wrap = page.locator("#top .medallion").locator("..");
      await expect(wrap).toHaveAttribute("data-animate", "on");
      const lit = await page.locator("#top .medallion .medallion-lit").first().evaluate((el) => getComputedStyle(el).animationName);
      expect(lit).toMatch(/^stage-/);
      await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
      await expect(wrap).not.toHaveAttribute("data-animate", "on");
    });

    test("the hero diagram pauses while the tab is hidden", async ({ page }) => {
      const wrap = page.locator("#top .medallion").locator("..");
      await expect(wrap).toHaveAttribute("data-animate", "on");
      await page.evaluate(() => {
        Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
        document.dispatchEvent(new Event("visibilitychange"));
      });
      await expect(wrap).not.toHaveAttribute("data-animate", "on");
      await page.evaluate(() => {
        Object.defineProperty(document, "hidden", { configurable: true, get: () => false });
        document.dispatchEvent(new Event("visibilitychange"));
      });
      await expect(wrap).toHaveAttribute("data-animate", "on");
    });
  });
});

test.describe("Metadata (Phase 9)", () => {
  test("lang, title, description, Open Graph and Twitter cards point at a 1200x630 image", async ({ page, request }) => {
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page).toHaveTitle("Srujan Rudrapati | Data Engineer");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /Databricks, Azure, and AWS/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", "https://srujanrudrapati.github.io/srujan-portfolio/og.png");
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
    const og = await request.get("/og.png");
    expect(og.status()).toBe(200);
    expect(og.headers()["content-type"]).toContain("image/png");
    expect((await request.get("/robots.txt")).status()).toBe(200);
  });
});
