import { describe, expect, it } from "vitest";
import { projects } from "../data/projects";
import { absoluteUrl, SITE_URL, siteRoutes } from "./site";

describe("site routes", () => {
  it("lists home, the main pages and every project once, and no redirects", () => {
    const routes = siteRoutes();
    expect(new Set(routes).size).toBe(routes.length);
    expect(routes[0]).toBe("/");
    for (const p of projects) expect(routes).toContain(`/work/${p.slug}`);
    expect(routes).not.toContain("/work/surplus-ai");
  });

  it("builds absolute URLs under the project site, without trailing slashes", () => {
    expect(absoluteUrl("/")).toBe(SITE_URL);
    expect(absoluteUrl("/work/label-lens")).toBe("https://srujanrudrapati.github.io/srujan-portfolio/work/label-lens");
  });
});
