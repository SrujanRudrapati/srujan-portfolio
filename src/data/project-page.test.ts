import { describe, expect, it } from "vitest";
import { nextInGroup, projectPage } from "./project-page";
import { projects } from "./projects";
import { FEATURED_ORDER, workItems } from "./work";

describe("project pages: next project", () => {
  const items = workItems();

  it("loops through the four featured projects in catalogue order", () => {
    const order = FEATURED_ORDER.map((slug) => nextInGroup(items, slug).slug);
    expect(order).toEqual([...FEATURED_ORDER.slice(1), FEATURED_ORDER[0]]);
  });

  it("loops the smaller projects among themselves and never jumps to a featured one", () => {
    const smaller = items.filter((p) => !p.featured);
    for (const [i, p] of smaller.entries()) {
      expect(nextInGroup(items, p.slug).slug).toBe(smaller[(i + 1) % smaller.length].slug);
    }
  });

  it("names the next project by its own title, the heading the visitor lands on", () => {
    expect(nextInGroup(items, "label-lens")).toEqual({ slug: "devhacks-cubbie", name: "DevHacks × Cubbie hackathon" });
  });

  it("throws on an unknown slug", () => {
    expect(() => nextInGroup(items, "nope")).toThrow(/unknown project/);
  });
});

describe("project pages: data", () => {
  it("builds a page for every project, featured ones with an art plate", () => {
    for (const p of projects) {
      const page = projectPage(p.slug);
      expect(page, p.slug).toBeDefined();
      expect(page!.featured).toBe(p.featured);
      expect(page!.art !== undefined).toBe(p.featured);
      expect(page!.kicker.length).toBeGreaterThan(0);
    }
  });

  it("returns undefined for a slug the graph does not have", () => {
    expect(projectPage("nope")).toBeUndefined();
  });

  it("gives DevHacks a kicker that does not repeat its title", () => {
    expect(projectPage("devhacks-cubbie")!.kicker).toBe("Cooked won first place, Track 1");
  });
});
