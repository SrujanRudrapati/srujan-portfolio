import { describe, expect, it } from "vitest";
import { certifications } from "../content/portfolio.ts";
import { certificationCards } from "./certifications.ts";

describe("certification cards", () => {
  const cards = certificationCards();

  it("has one card per certification in the graph, with the graph's full name", () => {
    expect(cards.map((c) => c.name).sort()).toEqual([...certifications].sort());
  });

  it("names an issuer and a badge file for every card, and no verify link yet", () => {
    for (const c of cards) {
      expect(c.issuer.length, c.id).toBeGreaterThan(0);
      expect(c.badge, c.id).toMatch(/^[a-z0-9-]+$/);
      expect(c.verifyUrl, c.id).toBeUndefined();
    }
    expect(new Set(cards.map((c) => c.badge)).size).toBe(cards.length);
  });
});
