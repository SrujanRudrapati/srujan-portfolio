import { describe, expect, it } from "vitest";
import { certifications } from "../content/portfolio.ts";
import { projects } from "./projects.ts";
import { celebal, hero, highlights, moreProjects, projectSections } from "./home.ts";
import { ICONS, GHOSTS, SCENES, VIGNETTES } from "../components/v5/art/drawings.tsx";

const slugs = new Set(projects.map((p) => p.slug));
const DASHES = /[–—]/;

describe("home data", () => {
  it("links every project section and More row to a project page that exists", () => {
    for (const s of projectSections) expect(slugs, s.slug).toContain(s.slug);
    for (const r of moreProjects) expect(slugs, r.slug).toContain(r.slug);
  });

  it("has a drawing for every section and an icon for every More row", () => {
    for (const s of projectSections) expect(SCENES[s.theme], s.theme).toBeDefined();
    for (const s of projectSections) expect(GHOSTS[s.theme], s.theme).toBeDefined();
    for (const r of moreProjects) expect(ICONS[r.icon], r.icon).toBeDefined();
  });

  it("gives every spread three drawings and three captions", () => {
    for (const s of [...projectSections, celebal]) {
      expect(VIGNETTES[s.theme], s.theme).toHaveLength(3);
      expect(s.spread, s.theme).toHaveLength(3);
      for (const c of s.spread) expect(c.trim().length, s.theme).toBeGreaterThan(0);
    }
  });

  it("claims as many certifications as the graph holds", () => {
    const certs = highlights.find((h) => h.label === "certifications");
    expect(Number(certs?.value)).toBe(certifications.length);
  });

  it("uses no en or em dashes in visible copy (portfolio-facts)", () => {
    const text = JSON.stringify({ hero, highlights, projectSections, moreProjects, celebal });
    expect(text).not.toMatch(DASHES);
  });

  it("never renders a placeholder link as a real href", () => {
    for (const s of projectSections) {
      for (const l of s.links) {
        if ("placeholder" in l) expect(l).not.toHaveProperty("href");
        else expect(l.href).toMatch(/^(https:\/\/|\/work\/)/);
      }
    }
  });
});
