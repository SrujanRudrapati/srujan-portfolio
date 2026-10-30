import { describe, expect, it } from "vitest";
import { formatCount, parseCount } from "./count";

describe("parseCount", () => {
  it("keeps approximate markers and units around the number", () => {
    expect(parseCount("~80%")).toEqual({ prefix: "~", n: 80, decimals: 0, suffix: "%" });
    expect(parseCount("about 10 million")).toEqual({ prefix: "about ", n: 10, decimals: 0, suffix: " million" });
    expect(parseCount("44/44")).toEqual({ prefix: "", n: 44, decimals: 0, suffix: "/44" });
  });

  it("returns null when there is no number to count", () => {
    expect(parseCount("live")).toBeNull();
  });

  it("formats interim values with the same text around them", () => {
    const p = parseCount("~10 min")!;
    expect(formatCount(p, 4.4)).toBe("~4 min");
    expect(formatCount(parseCount("3.5x")!, 1.25)).toBe("1.3x");
  });
});
