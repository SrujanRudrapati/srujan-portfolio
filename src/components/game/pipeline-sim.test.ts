import { describe, expect, it } from "vitest";
import { createWorld, step, PADDLE_Y, WORLD_H, WORLD_W, type World } from "./pipeline-sim";

const idle = { dir: 0 as const };

/** One record, placed by hand, nothing else spawning. */
function withRecord(x: number, y: number, vx = 0, vy = 0): World {
  const w = createWorld({ seed: 1 });
  w.spawnIn = Number.POSITIVE_INFINITY;
  w.pegs = [];
  w.recs.push({ id: 99, x, y, vx, vy, r: 14, kind: "null" });
  return w;
}

describe("Clean the pipeline: simulation", () => {
  it("records fall under gravity", () => {
    const w = withRecord(100, 40);
    step(w, 0.1, idle);
    expect(w.recs[0].vy).toBeGreaterThan(0);
    expect(w.recs[0].y).toBeGreaterThan(40);
  });

  it("bounces off the side walls, losing some speed", () => {
    const w = withRecord(16, 100, -300, 0);
    step(w, 0.05, idle);
    expect(w.recs[0].vx).toBeGreaterThan(0);
    expect(w.recs[0].vx).toBeLessThan(300);
    expect(w.recs[0].x).toBeGreaterThanOrEqual(w.recs[0].r);
  });

  it("bounces off a peg: the record ends up outside it, moving away", () => {
    const w = withRecord(180, 80, 0, 400);
    w.pegs = [{ x: 180, y: 110, r: 8 }];
    for (let i = 0; i < 6; i++) step(w, 1 / 60, idle);
    const r = w.recs[0];
    expect(Math.hypot(r.x - 180, r.y - 110)).toBeGreaterThanOrEqual(r.r + 8 - 0.01);
    expect(r.vy).toBeLessThan(400);
  });

  it("the filter catches a record that lands on it: score up, record gone", () => {
    const w = withRecord(w0().paddle.x, PADDLE_Y - 30, 0, 300);
    for (let i = 0; i < 30 && w.recs.length; i++) step(w, 1 / 60, idle);
    expect(w.recs).toHaveLength(0);
    expect(w.score).toBe(1);
    expect(w.lives).toBe(3);
    expect(w.events).toContain("caught");
  });

  it("a record that gets past the filter into gold costs a life", () => {
    const w = withRecord(20, PADDLE_Y - 30, 0, 300);
    w.paddle.x = WORLD_W - 60;
    for (let i = 0; i < 60 && w.recs.length; i++) step(w, 1 / 60, idle);
    expect(w.recs).toHaveLength(0);
    expect(w.lives).toBe(2);
    expect(w.events).toContain("missed");
  });

  it("three misses end the game, and nothing moves after that", () => {
    const w = createWorld({ seed: 3 });
    w.lives = 1;
    w.recs.push({ id: 1, x: 10, y: PADDLE_Y + 40, vx: 0, vy: 300, r: 14, kind: "duplicate" });
    w.paddle.x = WORLD_W - 60;
    for (let i = 0; i < 30; i++) step(w, 1 / 60, idle);
    expect(w.over).toBe(true);
    const frozen = JSON.stringify(w.recs);
    step(w, 0.5, idle);
    expect(JSON.stringify(w.recs)).toBe(frozen);
  });

  it("the filter moves with the keys and stays inside the walls", () => {
    const w = createWorld({ seed: 1 });
    const start = w.paddle.x;
    step(w, 0.1, { dir: 1 });
    expect(w.paddle.x).toBeGreaterThan(start);
    for (let i = 0; i < 200; i++) step(w, 1 / 30, { dir: 1 });
    expect(w.paddle.x + w.paddle.w / 2).toBeLessThanOrEqual(WORLD_W);
  });

  it("a pointer target pulls the filter toward it", () => {
    const w = createWorld({ seed: 1 });
    for (let i = 0; i < 60; i++) step(w, 1 / 60, { dir: 0, targetX: 40 });
    expect(Math.abs(w.paddle.x - Math.max(40, w.paddle.w / 2))).toBeLessThan(2);
  });

  it("spawns records over time, faster as the score rises", () => {
    const slow = createWorld({ seed: 7 });
    const fast = createWorld({ seed: 7 });
    fast.score = 30;
    let a = 0;
    let b = 0;
    for (let i = 0; i < 600; i++) {
      step(slow, 1 / 60, idle);
      step(fast, 1 / 60, idle);
      a = Math.max(a, slow.nextId);
      b = Math.max(b, fast.nextId);
    }
    expect(a).toBeGreaterThan(1);
    expect(b).toBeGreaterThan(a);
  });

  it("is deterministic for a seed", () => {
    const run = () => {
      const w = createWorld({ seed: 42 });
      for (let i = 0; i < 300; i++) step(w, 1 / 60, { dir: i % 90 < 45 ? 1 : -1 });
      return JSON.stringify({ recs: w.recs, score: w.score, lives: w.lives });
    };
    expect(run()).toBe(run());
  });

  it("stays in bounds", () => {
    const w = createWorld({ seed: 9 });
    for (let i = 0; i < 2000 && !w.over; i++) {
      step(w, 1 / 60, idle);
      for (const r of w.recs) {
        expect(r.x).toBeGreaterThanOrEqual(r.r - 0.001);
        expect(r.x).toBeLessThanOrEqual(WORLD_W - r.r + 0.001);
        expect(r.y).toBeLessThanOrEqual(WORLD_H + r.r * 2);
      }
    }
  });
});

function w0() {
  return createWorld({ seed: 1 });
}
