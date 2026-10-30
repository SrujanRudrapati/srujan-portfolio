import { Body, Box, Vec3 } from "cannon-es";
import { FIXED_STEP, MAX_SUBSTEPS, groundPlane, makeWorld, staticBox } from "../physics";
import { rng } from "../rng";

// The Surplus AI line as a pure simulation (no three.js), so it runs in Node tests.
// Items move by force only: roller traction toward belt speed (capped by grip), a
// centring force and a yaw-aligning torque inside each compute unit, gravity, and
// collisions with friction and restitution. The scene component only draws it.

export const BED_TOP = 0.72;
export const X0 = -2.35;
export const X1 = 1.55;
export const BELT_SPEED = 0.55; // m/s at the roller surface
export const ROLLER_R = 0.034;
export const UNIT_X = [-1.35, -0.6, 0.15, 0.9];
export const UNIT_HALF_X = 0.22;
export const UNIT_TOP = 0.4; // centre height of a unit's top slab above the bed: 0.34 m clear underneath
export const PALLET = { x: 1.88, hx: 0.5, hz: 0.4, top: 0.144 }; // its near edge sits under the end of the belt
const SPAWN_EVERY = 1.35;
const HOLD_AFTER_LAST = 9; // seconds the full pallet stays before it clears

export type Kind = "box" | "laptop" | "tablet" | "router" | "keyboard" | "drive";
export type Item = { kind: Kind; half: [number, number, number]; mass: number; body: Body; spawnedAt: number; alive: boolean; scale: number };

function itemPlan(rand: () => number): Pick<Item, "kind" | "half" | "mass">[] {
  const kinds: Kind[] = ["box", "laptop", "box", "router", "keyboard", "box", "tablet", "drive", "box", "laptop", "box", "router"];
  return kinds.map((kind) => {
    switch (kind) {
      case "box": {
        // Largest dimension stays under the units' clearance even when a box lands on its end.
        const s = 0.075 + rand() * 0.035;
        return { kind, half: [s * (1 + rand() * 0.3), s * (0.75 + rand() * 0.3), s], mass: 1.2 + rand() };
      }
      case "laptop":
        return { kind, half: [0.16, 0.012, 0.11], mass: 1.6 };
      case "tablet":
        return { kind, half: [0.12, 0.005, 0.085], mass: 0.6 };
      case "router":
        return { kind, half: [0.11, 0.025, 0.08], mass: 0.5 };
      case "keyboard":
        return { kind, half: [0.2, 0.012, 0.065], mass: 0.7 };
      default:
        return { kind, half: [0.06, 0.018, 0.085], mass: 0.3 };
    }
  });
}

function yawOf(b: Body) {
  const { x, y, z, w } = b.quaternion;
  return Math.atan2(2 * (w * y + x * z), 1 - 2 * (y * y + z * z));
}

export function inUnit(b: Body) {
  return UNIT_X.some((x) => Math.abs(b.position.x - x) < UNIT_HALF_X + 0.05) && b.position.y < BED_TOP + UNIT_TOP;
}

export function createSurplusSim(seed = 11) {
  const rand = rng(seed);
  const { world, mats } = makeWorld();
  groundPlane(world, mats.ground);
  const bedLen = X1 - X0;
  const bed = staticBox(world, mats.roller, [bedLen / 2, 0.05, 0.29], [(X0 + X1) / 2, BED_TOP - 0.05, 0]);
  staticBox(world, mats.ground, [bedLen / 2, 0.05, 0.015], [(X0 + X1) / 2, BED_TOP + 0.02, 0.3]);
  staticBox(world, mats.ground, [bedLen / 2, 0.05, 0.015], [(X0 + X1) / 2, BED_TOP + 0.02, -0.3]);
  for (const x of UNIT_X) staticBox(world, mats.ground, [UNIT_HALF_X, 0.06, 0.34], [x, BED_TOP + UNIT_TOP, 0]);
  staticBox(world, mats.ground, [0.02, 0.12, 0.3], [X0 - 0.02, BED_TOP + 0.08, 0]); // end stop behind the drop point
  staticBox(world, mats.wood, [PALLET.hx, PALLET.top / 2, PALLET.hz], [PALLET.x, PALLET.top / 2, 0]);

  const items: Item[] = itemPlan(rand).map((p) => {
    const body = new Body({ mass: p.mass, material: mats.item, shape: new Box(new Vec3(...p.half)), linearDamping: 0.05, angularDamping: 0.12, allowSleep: true, sleepSpeedLimit: 0.06, sleepTimeLimit: 0.6 });
    return { ...p, body, spawnedAt: -1, alive: false, scale: 0 };
  });

  // Which bodies touched the bed in the last step (contact equations list both bodies).
  const touching = new Set<Body>();
  world.addEventListener("postStep", () => {
    touching.clear();
    for (const c of world.contacts) {
      if (c.bi === bed) touching.add(c.bj);
      else if (c.bj === bed) touching.add(c.bi);
    }
  });
  const force = new Vec3();
  world.addEventListener("preStep", () => {
    for (const it of items) {
      const b = it.body;
      if (!it.alive) continue;
      // Anything still on the belt stays awake: a sleeping body gets no contacts, so no traction.
      const onBelt = b.position.x > X0 - 0.1 && b.position.x < X1 + 0.05 && b.position.y > BED_TOP - 0.05;
      if (onBelt) b.wakeUp();
      else if (b.sleepState === Body.SLEEPING) continue;
      if (touching.has(b)) {
        const cap = b.mass * 9.82 * 0.4; // traction limited by roller grip
        force.set(Math.max(-cap, Math.min(cap, b.mass * 9 * (BELT_SPEED - b.velocity.x))), 0, 0);
        b.applyForce(force); // at the centre of mass (cannon's second argument is body-relative)
      }
      if (inUnit(b)) {
        // Inside a unit: centre on the belt and square up to the direction of travel.
        force.set(0, 0, -b.mass * (40 * b.position.z + 6 * b.velocity.z));
        b.applyForce(force);
        const yaw = yawOf(b);
        const err = Math.atan2(Math.sin(4 * yaw), Math.cos(4 * yaw)) / 4; // boxes are square under 90° turns
        b.torque.y += -b.mass * 0.05 * (err * 30 + b.angularVelocity.y * 3);
      }
    }
  });

  const state = { time: 0, nextSpawn: 0, nextIndex: 0, clearAt: -1, spin: 0 };

  function spawn(it: Item) {
    const b = it.body;
    b.position.set(X0 + 0.25, BED_TOP + 0.35 + rand() * 0.15, (rand() - 0.5) * 0.24);
    b.velocity.set(0.2, 0, 0);
    b.angularVelocity.set((rand() - 0.5) * 3, (rand() - 0.5) * 4, (rand() - 0.5) * 3);
    b.quaternion.setFromEuler((rand() - 0.5) * 1.2, rand() * Math.PI, (rand() - 0.5) * 1.2);
    if (!world.bodies.includes(b)) world.addBody(b);
    b.wakeUp();
    it.alive = true;
    it.spawnedAt = state.time;
  }

  /** Advances the line by dt seconds: spawns, the clear-and-restart cycle, and the physics step. */
  function advance(dt: number) {
    state.time += dt;
    state.spin += (BELT_SPEED / ROLLER_R) * dt;
    if (state.clearAt < 0 && state.time >= state.nextSpawn && state.nextIndex < items.length) {
      spawn(items[state.nextIndex++]);
      state.nextSpawn = state.time + SPAWN_EVERY;
    }
    if (state.clearAt < 0 && state.nextIndex === items.length && state.time - items[items.length - 1].spawnedAt > HOLD_AFTER_LAST) state.clearAt = state.time;
    for (const it of items) {
      const target = it.alive && state.clearAt < 0 ? 1 : 0;
      it.scale += (target - it.scale) * Math.min(1, dt * 10);
      if (it.alive && state.clearAt >= 0 && it.scale < 0.02) {
        world.removeBody(it.body);
        it.alive = false;
      }
    }
    if (state.clearAt >= 0 && items.every((i) => !i.alive)) {
      state.clearAt = -1;
      state.nextIndex = 0;
      state.nextSpawn = state.time + 0.4;
    }
    world.step(FIXED_STEP, dt, MAX_SUBSTEPS);
  }

  /** A click: an upward impulse slightly off centre, so the item hops and spins a little. */
  function flick(i: number) {
    const it = items[i];
    if (!it.alive) return;
    it.body.wakeUp();
    it.body.applyImpulse(new Vec3((rand() - 0.5) * 0.8 * it.mass, 2.6 * it.mass, (rand() - 0.5) * 0.6 * it.mass), new Vec3((rand() - 0.5) * it.half[0], 0, (rand() - 0.5) * it.half[2]));
  }

  return { world, items, state, advance, flick };
}

export type SurplusSim = ReturnType<typeof createSurplusSim>;
