import { describe, expect, it } from "vitest";
import { buildTargets, seeded, SHAPES } from "./dot-shapes";
import { createDots, DAMPING, settle, setTargets, step } from "./dot-sim";

const N = 400;
const FAR = -9999;
const view = { cx: 200, cy: 150, scale: 100 };

describe("dot shapes", () => {
  it("every shape gives n points inside the field", () => {
    for (const shape of SHAPES) {
      const t = buildTargets(shape, N, seeded(1));
      expect(t.length).toBe(N * 2);
      for (let i = 0; i < t.length; i += 2) {
        expect(Math.abs(t[i])).toBeLessThanOrEqual(1.05);
        expect(Math.abs(t[i + 1])).toBeLessThanOrEqual(0.8);
      }
    }
  });
  it("is deterministic for a seed and different between shapes", () => {
    expect(buildTargets("work", 10, seeded(7))).toEqual(buildTargets("work", 10, seeded(7)));
    expect(buildTargets("work", 10, seeded(7))).not.toEqual(buildTargets("about", 10, seeded(7)));
  });
});

describe("dot physics", () => {
  it("springs every dot onto its target and comes to rest", () => {
    const targets = buildTargets("idle", N, seeded(2));
    const d = createDots(N, targets, seeded(3));
    let energy = Infinity;
    for (let f = 0; f < 1200 && energy > 1e-9; f++) energy = step(d, view, FAR, FAR);
    expect(energy).toBeLessThan(1e-9);
    for (let i = 0; i < N; i++) {
      expect(d.x[i]).toBeCloseTo(targets[i * 2], 3);
      expect(d.y[i]).toBeCloseTo(targets[i * 2 + 1], 3);
    }
  });

  it("damps velocity by 0.86 per step", () => {
    const d = createDots(1, new Float32Array([0, 0]), seeded(4));
    d.x[0] = d.y[0] = 0;
    d.vx[0] = 1;
    step(d, view, FAR, FAR);
    expect(d.vx[0]).toBeCloseTo(DAMPING, 5);
  });

  it("pushes dots away from a pointer within 60px, and not beyond", () => {
    const d = createDots(1, new Float32Array([0, 0]), seeded(5));
    settle(d);
    step(d, view, view.cx + 30, view.cy); // pointer 30px to the right
    expect(d.vx[0]).toBeLessThan(0);
    settle(d);
    step(d, view, view.cx + 90, view.cy);
    expect(d.vx[0]).toBe(0);
  });

  it("retargets in place without allocating new arrays", () => {
    const d = createDots(N, buildTargets("idle", N, seeded(6)), seeded(6));
    const before = d.tx;
    setTargets(d, buildTargets("contact", N, seeded(6)));
    expect(d.tx).toBe(before);
  });

  it("about 18% of the dots are bronze", () => {
    const d = createDots(5000, buildTargets("idle", 5000, seeded(8)), seeded(9));
    const share = d.bronze.reduce((a, b) => a + b, 0) / 5000;
    expect(share).toBeGreaterThan(0.15);
    expect(share).toBeLessThan(0.21);
  });
});
