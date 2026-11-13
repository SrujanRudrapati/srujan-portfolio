import { describe, expect, it } from "vitest";
import { bandAt, easeInOutQuad, hypotrochoid, kolamDots, lengthFor, lengthTable, spline } from "./geometry";

describe("spline", () => {
  it("returns an empty path for no points", () => {
    expect(spline([])).toBe("");
  });

  it("starts at the first point and ends at the last with one curve per gap", () => {
    const d = spline([
      [0, 0],
      [10, 20],
      [30, 40],
    ]);
    expect(d.startsWith("M0.0 0.0")).toBe(true);
    expect(d.match(/C/g)).toHaveLength(2);
    expect(d.endsWith("30.0 40.0")).toBe(true);
  });
});

describe("lengthTable and lengthFor", () => {
  // A path whose y goes 0, 100, 50 (loops back up), 200 across four samples.
  const ys = [0, 100, 50, 200];
  const table = lengthTable(ys.length - 1, (i) => ys[i]);

  it("keeps the running maximum so the table never decreases", () => {
    expect(table).toEqual([0, 100, 100, 200]);
  });

  it("draws nothing above the start and everything below the end", () => {
    expect(lengthFor(table, 300, -5)).toBe(0);
    expect(lengthFor(table, 300, 999)).toBe(300);
  });

  it("interpolates inside a sample", () => {
    expect(lengthFor(table, 300, 50)).toBeCloseTo(50);
  });

  it("is monotonic in y", () => {
    let last = -1;
    for (let y = 0; y <= 200; y += 10) {
      const l = lengthFor(table, 300, y);
      expect(l).toBeGreaterThanOrEqual(last);
      last = l;
    }
  });
});

describe("bandAt", () => {
  const bands = [
    { name: "paper", top: 0, bottom: 100 },
    { name: "surplus", top: 100, bottom: 300 },
  ] as const;

  it("finds the section containing y", () => {
    expect(bandAt(bands, 150, "paper")).toBe("surplus");
  });

  it("falls back between sections", () => {
    expect(bandAt(bands, 400, "paper")).toBe("paper");
  });
});

describe("kolam", () => {
  it("places 24 dots inside the radius", () => {
    const dots = kolamDots(0, 0, 100);
    expect(dots).toHaveLength(24);
    for (const d of dots) expect(Math.hypot(d.cx, d.cy)).toBeLessThanOrEqual(100);
  });

  it("draws a closed hypotrochoid that stays within its scale", () => {
    const d = hypotrochoid({ a: 5, d: 4, k: 5 / 3, turns: 3, scale: 100, rot: 0, steps: 90, cx: 0, cy: 0 });
    const nums = d.match(/-?\d+\.\d/g)!.map(Number);
    expect(Math.max(...nums.map(Math.abs))).toBeLessThanOrEqual(100.1);
  });
});

describe("easeInOutQuad", () => {
  it("is clamped and symmetric", () => {
    expect(easeInOutQuad(-1)).toBe(0);
    expect(easeInOutQuad(2)).toBe(1);
    expect(easeInOutQuad(0.5)).toBeCloseTo(0.5);
  });
});
