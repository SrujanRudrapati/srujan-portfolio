import { describe, expect, it } from "vitest";
import { arizonaTime } from "./Clock";

describe("arizonaTime", () => {
  it("reads Phoenix time, which has no daylight saving (UTC-7 all year)", () => {
    expect(arizonaTime(new Date("2026-01-15T19:05:00Z"))).toBe("12:05 PM");
    expect(arizonaTime(new Date("2026-07-15T19:05:00Z"))).toBe("12:05 PM");
  });
});
