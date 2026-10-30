import { describe, expect, it } from "vitest";
import { appPath } from "./PageTransitions";

describe("appPath (router targets never carry the GitHub Pages basePath)", () => {
  it("strips the basePath so router.push does not add it twice", () => {
    expect(appPath("/srujan-portfolio/work/label-lens", "/srujan-portfolio")).toBe("/work/label-lens");
    expect(appPath("/srujan-portfolio", "/srujan-portfolio")).toBe("/");
    expect(appPath("/srujan-portfolio/", "/srujan-portfolio")).toBe("/");
  });

  it("normalises trailing slashes and leaves unprefixed paths alone", () => {
    expect(appPath("/work/", "")).toBe("/work");
    expect(appPath("/", "")).toBe("/");
    expect(appPath("/srujan-portfolio-other/x", "/srujan-portfolio")).toBe("/srujan-portfolio-other/x");
  });
});
