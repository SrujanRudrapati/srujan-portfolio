import { describe, expect, it } from "vitest";
import { CURSOR_TARGETS, cursorLabelFor, lerp } from "./pointer";

describe("lerp", () => {
  it("moves 18% of the way toward the target per step", () => {
    expect(lerp(0, 100, 0.18)).toBeCloseTo(18);
    expect(lerp(100, 100, 0.18)).toBe(100);
  });
});

describe("cursorLabelFor", () => {
  const fake = (hit: { cursor?: string } | null) =>
    ({
      closest: (sel: string) => (sel === CURSOR_TARGETS && hit ? { getAttribute: () => hit.cursor ?? null } : null),
    }) as unknown as Element;

  it("uses the target's own word", () => {
    expect(cursorLabelFor(fake({ cursor: "Open" }))).toBe("Open");
  });
  it("says View over a giant heading", () => {
    expect(cursorLabelFor(fake({}))).toBe("View");
  });
  it("hides elsewhere and with no target", () => {
    expect(cursorLabelFor(fake(null))).toBe("");
    expect(cursorLabelFor(null)).toBe("");
  });
});
