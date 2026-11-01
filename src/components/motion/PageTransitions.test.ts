import { describe, expect, it } from "vitest";
import { appPath, isPendingArrival } from "./PageTransitions";

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

describe("isPendingArrival (a slow route still counts as our navigation)", () => {
  it("matches the arrived path, ignoring search, hash, basePath and trailing slash", () => {
    expect(isPendingArrival("/work/label-lens#results", "/work/label-lens", "")).toBe(true);
    expect(isPendingArrival("/work?x=1", "/work/", "")).toBe(true);
    expect(isPendingArrival("/about", "/srujan-portfolio/about", "/srujan-portfolio")).toBe(true);
  });

  it("is false with nothing pending or for another path", () => {
    expect(isPendingArrival(null, "/work", "")).toBe(false);
    expect(isPendingArrival("/work", "/about", "")).toBe(false);
  });
});
