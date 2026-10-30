import { describe, expect, it } from "vitest";
import { FIXED_STEP } from "../physics";
import { BED_TOP, PALLET, X0, createSurplusSim } from "./surplus-sim";

function run(sim: ReturnType<typeof createSurplusSim>, seconds: number) {
  for (let t = 0; t < seconds; t += FIXED_STEP) sim.advance(FIXED_STEP);
}

describe("Surplus AI line simulation", () => {
  it("carries items down the belt and onto the pallet", () => {
    const sim = createSurplusSim();
    run(sim, 16);
    const onPallet = sim.items.filter((i) => i.alive && Math.abs(i.body.position.x - PALLET.x) < PALLET.hx + 0.2 && i.body.position.y < BED_TOP);
    expect(onPallet.length).toBeGreaterThanOrEqual(4);
  });

  it("never loses an item through the floor or off the back of the belt", () => {
    const sim = createSurplusSim();
    run(sim, 20);
    for (const it of sim.items.filter((i) => i.alive)) {
      expect(it.body.position.y).toBeGreaterThan(0);
      expect(it.body.position.x).toBeGreaterThan(X0 - 0.3);
    }
  });

  it("is deterministic for a seed (posters render the same frame every time)", () => {
    const a = createSurplusSim(3);
    const b = createSurplusSim(3);
    run(a, 6);
    run(b, 6);
    expect(a.items.map((i) => i.body.position.x.toFixed(4))).toEqual(b.items.map((i) => i.body.position.x.toFixed(4)));
  });
});
