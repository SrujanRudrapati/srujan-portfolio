import { expect, test } from "@playwright/test";
import { profile } from "../src/content/profile";
import { facts, paragraphs, statement } from "../src/data/about";
import { expectNoA11yViolations } from "./helpers";

// Runbook v4 W6: About and Contact.

test.describe("v4 about", () => {
  test("statement, paragraphs and the full facts grid from the data", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("About");
    await expect(page.getByText(statement)).toBeVisible();
    for (const p of paragraphs) await expect(page.getByText(p)).toBeVisible();
    const all = facts();
    await expect(page.locator("main h2")).toHaveText(all.map((f) => f.heading));
    for (const f of all) for (const line of f.lines) await expect(page.getByText(line, { exact: true })).toBeAttached();
  });

  test("older links still land: #credentials and #skills; the medallion diagram and the skill map link stay", async ({ page }) => {
    await page.goto("/about#credentials");
    await expect(page.locator("#credentials")).toContainText("Education");
    await expect(page.locator("#skills")).toContainText("Data engineering");
    await expect(page.getByRole("img", { name: /Data pipeline from source systems up to LLMs and agents/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /skill map/ })).toHaveAttribute("href", /\/explore#lens=skills$/);
  });

  test("without a portrait file the frame is a decorative outline", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("img", { name: "Srujan Rudrapati" })).toHaveCount(0);
    await expect(page.locator("main [aria-hidden='true'] svg circle")).toHaveCount(1); // hidden on phones, still in the markup
  });

  test("no accessibility violations", async ({ page }) => {
    await page.goto("/about");
    await expectNoA11yViolations(page);
  });
});

test.describe("v4 contact", () => {
  test("the email, the profile links and the resume, all from the profile", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Contact");
    await expect(page.getByText(`${profile.status}.`)).toBeVisible();
    await expect(page.getByRole("link", { name: profile.email })).toHaveAttribute("href", `mailto:${profile.email}`);
    const links = page.getByRole("list", { name: "Profiles and resume" });
    await expect(links.getByRole("link", { name: /GitHub/ })).toHaveAttribute("href", profile.github);
    await expect(links.getByRole("link", { name: /LinkedIn/ })).toHaveAttribute("href", profile.linkedin);
    await expect(links.getByRole("link", { name: /Resume \(PDF\)/ })).toHaveAttribute("href", /\/resume\.pdf$/);
  });

  test("the composer builds a mailto with the fixed subject and the note as the body", async ({ page }) => {
    await page.goto("/contact");
    const send = page.getByRole("link", { name: "Open in my email app" });
    await expect(send).toHaveAttribute("href", `mailto:${profile.email}?subject=Role%20for%20a%20data%20or%20AI%20engineer`);
    const note = "Hi Srujan,\nwe’re hiring a data engineer & would like to talk.";
    await page.getByLabel("Write a note").fill(note);
    const href = await send.getAttribute("href");
    const url = new URL(href!);
    expect(url.protocol).toBe("mailto:");
    expect(url.pathname).toBe(profile.email);
    expect(url.searchParams.get("subject")).toBe("Role for a data or AI engineer");
    expect(url.searchParams.get("body")).toBe(note);
  });

  test("Copy email copies the address and says so", async ({ page, context, browserName }) => {
    test.skip(browserName !== "chromium", "clipboard permission");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/contact");
    await page.getByRole("button", { name: "Copy email" }).click();
    await expect(page.getByRole("button", { name: "Email copied" })).toBeVisible();
    await expect(page.getByRole("status")).toHaveText("Email address copied.");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(profile.email);
  });

  test("the Ask entry opens the Ask panel", async ({ page }) => {
    await page.goto("/contact");
    // A click before hydration does nothing (as on the home page), so retry until the panel opens.
    await expect(async () => {
      await page.getByRole("button", { name: "Ask about my work" }).click();
      await expect(page.getByRole("dialog", { name: /ask|command palette/i })).toBeVisible({ timeout: 1000 });
    }).toPass({ timeout: 10000 });
  });

  test("the address stays on screen at phone width", async ({ page, isMobile }) => {
    test.skip(!isMobile, "phone layout");
    await page.goto("/contact");
    const box = (await page.getByRole("link", { name: profile.email }).boundingBox())!;
    expect(box.x + box.width).toBeLessThanOrEqual(390);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  });

  test("no accessibility violations", async ({ page }) => {
    await page.goto("/contact");
    await expectNoA11yViolations(page);
  });
});
