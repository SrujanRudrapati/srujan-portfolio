import { describe, expect, it } from "vitest";
import { anchorFor, externalEvidence, isRoute } from "./answer";

describe("Ask evidence links point at pages (V3)", () => {
  it("sends each node type to its page", () => {
    expect(anchorFor({ id: "project-label-lens", type: "project", evidence: [] })).toBe("/work/label-lens");
    expect(anchorFor({ id: "role-x", type: "role", evidence: [] })).toBe("/experience");
    expect(anchorFor({ id: "education-x", type: "education", evidence: [] })).toBe("/about#credentials");
    expect(anchorFor({ id: "cert-x", type: "certification", evidence: [] })).toBe("/about#credentials");
    expect(anchorFor({ id: "metric-x", type: "metric", evidence: ["https://example.com", "/work/surplus-station"] })).toBe("/work/surplus-station");
  });

  it("tells pages from files and other sites", () => {
    expect(isRoute("/about#skills")).toBe(true);
    expect(isRoute("/resume.pdf")).toBe(false);
    expect(externalEvidence({ evidence: ["/work/label-lens", "/resume.pdf", "https://label-lens-iota.vercel.app"] })).toEqual(["/resume.pdf", "https://label-lens-iota.vercel.app"]);
  });
});
