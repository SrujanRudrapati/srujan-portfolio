import { describe, expect, it } from "vitest";
import { cursorStateFor, lerp, magneticOffset } from "./pointer";

describe("lerp", () => {
  it("moves 18% of the way toward the target per step", () => {
    expect(lerp(0, 100, 0.18)).toBeCloseTo(18);
    expect(lerp(100, 100, 0.18)).toBe(100);
  });
});

describe("magneticOffset", () => {
  it("is 25% of the pointer's offset from the element's centre", () => {
    const rect = { left: 100, top: 100, width: 40, height: 40 }; // centre 120,120
    expect(magneticOffset(rect, 160, 120)).toEqual({ dx: 10, dy: 0 });
    expect(magneticOffset(rect, 120, 80)).toEqual({ dx: 0, dy: -10 });
  });
  it("is zero at the centre", () => {
    expect(magneticOffset({ left: 0, top: 0, width: 10, height: 10 }, 5, 5)).toEqual({ dx: 0, dy: 0 });
  });
});

describe("cursorStateFor", () => {
  const fake = (matches: Record<string, string | null>) =>
    ({
      closest: (sel: string) => {
        if (sel === "[data-cursor]") return matches.label ? { getAttribute: () => matches.label } : null;
        return matches.link ? {} : null;
      },
    }) as unknown as Element;

  it("shows a label from the nearest data-cursor", () => {
    expect(cursorStateFor(fake({ label: "Open" }))).toEqual({ state: "label", label: "Open" });
  });
  it("grows over links and buttons", () => {
    expect(cursorStateFor(fake({ link: "a" }))).toEqual({ state: "hover", label: "" });
  });
  it("is the plain ring elsewhere and with no target", () => {
    expect(cursorStateFor(fake({}))).toEqual({ state: "", label: "" });
    expect(cursorStateFor(null)).toEqual({ state: "", label: "" });
  });
});
