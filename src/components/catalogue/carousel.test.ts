import { describe, expect, it } from "vitest";
import { dragStep, loopOffset, wheelStep, wrapIndex, wraps } from "./carousel";

describe("loopOffset", () => {
  it("places neighbours either side and loops around", () => {
    expect([0, 1, 2, 3].map((i) => loopOffset(i, 0, 4))).toEqual([0, 1, 2, -1]);
    expect([0, 1, 2, 3].map((i) => loopOffset(i, 3, 4))).toEqual([1, 2, -1, 0]);
  });
});

describe("wraps", () => {
  it("flags only the card that jumps across the loop", () => {
    // 0 → 1: card 2 goes from +2 to +1 (animates), card 3 from -1 to +2 (wraps).
    expect([0, 1, 2, 3].map((i) => wraps(i, 1, 0, 4))).toEqual([false, false, false, true]);
    // 3 → 0 (next after the last): card 1 from +2 to +1, card 2 from -1 to +2 (wraps).
    expect([0, 1, 2, 3].map((i) => wraps(i, 0, 3, 4))).toEqual([false, false, true, false]);
  });
});

describe("wrapIndex", () => {
  it("after the last comes the first, before the first the last", () => {
    expect(wrapIndex(4, 4)).toBe(0);
    expect(wrapIndex(-1, 4)).toBe(3);
  });
});

describe("dragStep and wheelStep", () => {
  it("needs more than 60px of drag", () => {
    expect(dragStep(-60)).toBe(0);
    expect(dragStep(-61)).toBe(1);
    expect(dragStep(80)).toBe(-1);
  });
  it("only moves for horizontal wheel gestures over 12", () => {
    expect(wheelStep(30, 5)).toBe(1);
    expect(wheelStep(-30, 5)).toBe(-1);
    expect(wheelStep(10, 0)).toBe(0);
    expect(wheelStep(20, 40)).toBe(0);
  });
});
