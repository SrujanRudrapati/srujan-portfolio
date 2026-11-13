import { expect, test } from "@playwright/test";
import { profile } from "../src/content/profile";
import { celebal, hero, moreProjects, projectSections } from "../src/data/home";
import { THEMES } from "../src/lib/themes";
import { certificationCards } from "../src/data/certifications";
import { expectNoA11yViolations, openHome } from "./helpers";

// v5 home (design/redesign.html): one long page, one thread, per-section themes, three toy demos.

test.describe("v5 home: content", () => {
  test("hero: headline, place, availability, and the name drawn but not read", async ({ page }) => {
    await openHome(page);
    await expect(page.locator("main h1")).toHaveAccessibleName(hero.headline);
    const top = page.locator("#top");
    await expect(top).toContainText(profile.location);
    await expect(top).toContainText("Available January 2027. Open to relocating anywhere in the US, or remote.");
    await expect(top.locator("[data-giant='hero']")).toHaveAttribute("aria-hidden", "true");
  });

  test("six project sections, each a named heading with its figures, the first one ringed", async ({ page }) => {
    await openHome(page);
    for (const p of projectSections) {
      const section = page.locator(`section[aria-labelledby="${p.slug}-heading"]`);
      await expect(section.getByRole("heading", { level: 2, name: p.name })).toHaveCount(1);
      for (const f of p.figures) await expect(section).toContainText(f.value);
      await expect(section.locator("ul li").first().locator("svg path")).toHaveCount(1);
    }
    await expect(page.getByRole("heading", { level: 2, name: celebal.name })).toHaveCount(1);
  });

  test("links: live demos go out, every project links to its page, missing links are visible placeholders", async ({ page }) => {
    await openHome(page);
    await expect(page.getByRole("link", { name: /Open the live demo/ })).toHaveAttribute("href", "https://invoiceguard-srujan.onrender.com");
    await expect(page.getByRole("link", { name: /Open the live app/ })).toHaveAttribute("href", "https://label-lens-iota.vercel.app");
    for (const p of projectSections) await expect(page.locator(`main a[href$="/work/${p.slug}"]`).first()).toBeVisible();
    for (const r of moreProjects) await expect(page.locator(`main a[href$="/work/${r.slug}"]`)).toHaveCount(1);
    await expect(page.getByText("GitHub: repository link to come")).toHaveCount(2);
    await expect(page.getByText("Watch the walkthrough: walkthrough video to come")).toBeVisible();
    await expect(page.getByText("[Photo from the event to come]")).toBeVisible();
  });

  test("Let's talk reaches me: email, LinkedIn, GitHub, résumé, Ask", async ({ page }) => {
    await openHome(page);
    const talk = page.locator("#contact");
    await expect(talk.getByRole("link", { name: "Let’s talk." })).toHaveAttribute("href", `mailto:${profile.email}`);
    await expect(talk.getByRole("link", { name: /^LinkedIn/ })).toHaveAttribute("href", profile.linkedin);
    await expect(talk.getByRole("link", { name: /^GitHub/ })).toHaveAttribute("href", profile.github);
    await expect(talk.getByRole("link", { name: /^Résumé PDF/ })).toHaveAttribute("href", /\/resume\.pdf$/);
    await talk.getByRole("button", { name: "Ask about my work" }).click();
    await expect(page.getByRole("dialog", { name: /ask/i })).toBeVisible();
  });
});

test.describe("v5 home: spreads", () => {
  test("every project section opens with a spread: the main scene and three captioned drawings", async ({ page }) => {
    await openHome(page);
    for (const p of [...projectSections, { slug: "celebal", spread: celebal.spread }]) {
      const section = page.locator(`section[aria-labelledby="${p.slug}-heading"]`);
      const captions = section.locator("figure figcaption");
      await expect(captions).toHaveText([...p.spread]);
      await expect(section.locator("figure svg[aria-hidden='true']")).toHaveCount(3);
    }
  });
});

test.describe("v5 home: Certified", () => {
  test("five cards: badge (or its placeholder), full name and issuer, and no links yet", async ({ page }) => {
    await openHome(page);
    const cards = page.getByRole("list", { name: "Certifications" }).getByRole("listitem");
    await expect(cards).toHaveCount(certificationCards().length);
    for (const [i, c] of certificationCards().entries()) {
      const card = cards.nth(i);
      await expect(card).toContainText(c.name);
      await expect(card).toContainText(c.issuer);
      // Until public/badges/<badge>.<ext> exists the card shows a neutral placeholder, never a stand-in image.
      const img = card.getByRole("img", { name: c.name });
      const placeholder = card.locator(`[data-badge-missing="${c.badge}"]`);
      expect((await img.count()) + (await placeholder.count())).toBe(1);
      await expect(card.getByRole("link")).toHaveCount(0);
    }
  });

  test("five in a row on desktop; two columns on phones with the fifth centred", async ({ page, isMobile }) => {
    await openHome(page);
    const boxes = await page.getByRole("list", { name: "Certifications" }).getByRole("listitem").evaluateAll((els) =>
      els.map((e) => {
        const r = e.getBoundingClientRect();
        return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), mid: Math.round(r.x + r.width / 2) };
      }),
    );
    const list = await page.getByRole("list", { name: "Certifications" }).boundingBox();
    if (!isMobile) {
      expect(new Set(boxes.map((b) => b.y)).size).toBe(1);
      for (const b of boxes) expect(Math.abs(b.w - boxes[0].w), "equal widths").toBeLessThanOrEqual(1);
      return;
    }
    expect(boxes[0].y).toBe(boxes[1].y);
    expect(boxes[2].y).toBe(boxes[3].y);
    expect(boxes[4].y).toBeGreaterThan(boxes[2].y);
    expect(Math.abs(boxes[4].mid - (list!.x + list!.width / 2))).toBeLessThanOrEqual(1);
    expect(Math.abs(boxes[4].w - boxes[0].w)).toBeLessThanOrEqual(1);
  });

  test("the About illustration is the graduation cap alone", async ({ page }) => {
    await openHome(page);
    await expect(page.locator("#about svg[role='img']").first()).toHaveAccessibleName("A graduation cap");
    await expect(page.locator("#about svg[role='img']").first().locator("circle")).toHaveCount(1);
  });
});

test.describe("v5 home: toy demos", () => {
  test("InvoiceGuard: tampering sends it to a person, and back", async ({ page }) => {
    await openHome(page);
    const button = page.getByRole("button", { name: "Tamper with the total" });
    await button.click();
    await expect(page.getByText("Sent to a person. The page says 180.00, but 48.00 + 60.00 is 108.00.")).toBeVisible();
    await page.getByRole("button", { name: "Put it back" }).click();
    await expect(page.getByText("Auto-approved. Every value was found on the page and the math adds up.")).toBeVisible();
    await expect(page.getByText("A toy version with sample numbers. The real one is in the live demo.")).toBeVisible();
  });

  test("Label Lens: a warning quotes the label, or there is none", async ({ page }) => {
    await openHome(page);
    await page.getByRole("button", { name: "Milk", exact: true }).click();
    await expect(page.getByRole("button", { name: "Milk", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("Warning for milk. The label says “milk powder”.")).toBeVisible();
    await page.getByRole("button", { name: "Shellfish" }).click();
    await expect(page.getByText("Nothing on this label to quote for shellfish, so no warning.")).toBeVisible();
    await expect(page.getByText("A toy version with a made-up label.")).toBeVisible();
  });

  test("RecordSync: matching shows the golden record with sources", async ({ page }) => {
    await openHome(page);
    const button = page.getByRole("button", { name: "Match the records" });
    await button.click();
    await expect(page.getByRole("button", { name: "Split them again" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("from B")).toBeVisible();
    await expect(page.getByText("A toy version with made-up records.")).toBeVisible();
  });
});

test.describe("v5 home: thread and themes", () => {
  test("the thread is one path through the page, ending in the kolam", async ({ page }) => {
    await openHome(page);
    const paths = page.locator("svg[data-thread] > path");
    await expect(paths).toHaveCount(3);
    for (const d of await paths.evaluateAll((els) => els.map((e) => e.getAttribute("d") ?? ""))) expect(d.length).toBeGreaterThan(100);
    await expect(page.locator("svg[data-thread] g circle")).toHaveCount(24 + 6); // kolam dots + beads
    const svgH = await page.locator("svg[data-thread]").evaluate((e) => e.getBoundingClientRect().height);
    const mainH = await page.locator("main").evaluate((e) => e.scrollHeight);
    expect(Math.abs(svgH - mainH)).toBeLessThan(2);
  });

  test("each section's theme takes over as it scrolls in", async ({ page }) => {
    await openHome(page);
    const ground = () => page.evaluate(() => document.documentElement.style.getPropertyValue("--ground"));
    await expect.poll(ground).toBe(THEMES.paper[0]);
    for (const p of [projectSections[1], projectSections[3]]) {
      await page.locator(`section[aria-labelledby="${p.slug}-heading"]`).evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + scrollY));
      await expect.poll(ground).toBe(THEMES[p.theme][0]);
    }
    await page.locator("#contact").evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + scrollY));
    await expect.poll(ground).toBe(THEMES.night[0]);
  });

  test("leaving the home page restores the default palette", async ({ page }) => {
    await openHome(page);
    await page.locator("#contact").evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + scrollY));
    await expect.poll(() => page.evaluate(() => document.documentElement.style.getPropertyValue("--ground"))).toBe(THEMES.night[0]);
    await page.locator("main a[href$='/work/margin-radar']").click();
    await expect(page).toHaveURL(/\/work\/margin-radar\/?$/);
    await expect.poll(() => page.evaluate(() => document.documentElement.style.getPropertyValue("--ground"))).toBe("");
  });

  test("with reduced motion every drawing is finished and nothing waits on scroll", async ({ page }) => {
    await openHome(page);
    const hidden = await page.locator("main svg[role='img'] path").evaluateAll((els) => els.filter((e) => getComputedStyle(e).strokeDashoffset !== "0px" && getComputedStyle(e).strokeDasharray !== "none").length);
    expect(hidden).toBe(0);
    await expect(page.locator("main h1")).toHaveCSS("opacity", "1");
  });

  test("no accessibility violations", async ({ page }) => {
    await openHome(page);
    await expectNoA11yViolations(page);
  });
});

test.describe("v5: old addresses", () => {
  test("/work/surplus-ai points at Surplus Station", async ({ page }) => {
    await page.goto("/work/surplus-ai");
    await expect(page).toHaveURL(/\/work\/surplus-station\/?$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Surplus Station");
  });
});
