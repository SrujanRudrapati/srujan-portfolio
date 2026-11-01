import { describe, expect, it } from "vitest";
import { cardPose, cubicBezier, ease, loopOffset, releaseStep, resist, velocity, wrapIndex } from "./carousel";

describe("loopOffset", () => {
  it("places neighbours either side and loops around", () => {
    expect([0, 1, 2, 3].map((i) => loopOffset(i, 0, 4))).toEqual([0, 1, 2, -1]);
    expect([0, 1, 2, 3].map((i) => loopOffset(i, 3, 4))).toEqual([1, 2, -1, 0]);
  });
  it("works mid-slide", () => {
    expect(loopOffset(1, 0.25, 4)).toBeCloseTo(0.75);
    expect(loopOffset(0, 3.5, 4)).toBeCloseTo(0.5);
  });
});

describe("wrapIndex", () => {
  it("after the last comes the first, before the first the last", () => {
    expect(wrapIndex(4, 4)).toBe(0);
    expect(wrapIndex(-1, 4)).toBe(3);
  });
});

describe("resist", () => {
  it("follows 1:1 for most of a card, then gives way slowly", () => {
    expect(resist(-300, 1000)).toBe(-300);
    expect(resist(750, 1000)).toBe(750);
    expect(resist(800, 1000)).toBeCloseTo(750 + 50 * 0.35, -1); // slope 0.35 where it starts
    expect(resist(-5000, 1000)).toBeLessThan(-900);
    expect(resist(-5000, 1000)).toBeGreaterThan(-950); // capped below one step
    expect(resist(1e6, 1000)).toBeLessThanOrEqual(950);
  });
});

describe("velocity", () => {
  it("measures the last 100 ms only", () => {
    const s = [
      { t: 0, d: 0 },
      { t: 900, d: -10 },
      { t: 1000, d: -60 },
    ];
    expect(velocity(s, 1000)).toBeCloseTo(-0.5);
    expect(velocity(s, 1200)).toBe(0); // held still before letting go
    expect(velocity([], 0)).toBe(0);
  });
});

describe("releaseStep", () => {
  it("advances past 20% of the width or on a fast flick, else springs back", () => {
    expect(releaseStep(-201, 0, 1000)).toBe(1);
    expect(releaseStep(201, 0, 1000)).toBe(-1);
    expect(releaseStep(-150, -0.2, 1000)).toBe(0);
    expect(releaseStep(-40, -0.8, 1000)).toBe(1);
    expect(releaseStep(40, 0.8, 1000)).toBe(-1);
    expect(releaseStep(-6, -2, 1000)).toBe(0); // a jittery tap is a click, not a flick
  });
});

describe("cardPose", () => {
  it("is full size in front, 0.94 at the side, about 0.96 mid-slide, hidden past one place", () => {
    expect(cardPose(0)).toEqual({ scale: 1, opacity: 1, art: -0 });
    expect(cardPose(1).scale).toBeCloseTo(0.94);
    expect(cardPose(-0.5).scale).toBeCloseTo(0.955);
    expect(cardPose(1.5).opacity).toBe(0);
    expect(cardPose(1).art).toBeLessThan(0);
    expect(cardPose(-2).art).toBe(cardPose(-1).art);
  });
});

describe("ease", () => {
  it("matches the ends and is front-loaded like --ease", () => {
    expect(ease(0)).toBe(0);
    expect(ease(1)).toBe(1);
    expect(ease(0.5)).toBeGreaterThan(0.85);
    expect(cubicBezier(0, 0, 1, 1)(0.3)).toBeCloseTo(0.3, 3);
  });
});
