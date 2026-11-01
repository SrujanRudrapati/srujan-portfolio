import { rng } from "./rng.ts";

// "Clean the pipeline" (runbook V1.5, built in V6): the physics, with no DOM and no drawing,
// so it is unit tested (pipeline-sim.test.ts). Bad records fall under gravity through the
// bronze and silver bands, bounce off the walls and the pegs, and the player's filter must
// catch them before they reach gold. Three misses end the run.
//
// The world mutates in place: step() runs every frame, and allocating a new world 60 times a
// second is what motion-system rules out ("no per-frame allocation"). Callers treat it as the
// game's own state and only read it to draw.

export const WORLD_W = 360;
export const WORLD_H = 520;
/** Band boundaries (y): bronze above SILVER_Y, silver above PADDLE_Y, gold below. */
export const SILVER_Y = 200;
export const PADDLE_Y = 400;

const GRAVITY = 900;
const RESTITUTION = 0.55;
const MAX_FALL = 620;
const PADDLE_SPEED = 520;
const PADDLE_W = 96;
const PADDLE_H = 12;
const RECORD_R = 14;
const LIVES = 3;
const SPAWN_START_S = 1.3;
const SPAWN_MIN_S = 0.45;
const SPAWN_STEP_S = 0.03; // per record caught
const POINTER_GAIN = 12; // how hard the filter chases a pointer target, per second

export type Kind = "null" | "duplicate" | "malformed";
export type Rec = { id: number; x: number; y: number; vx: number; vy: number; r: number; kind: Kind };
export type Peg = { x: number; y: number; r: number };
export type GameEvent = "caught" | "missed" | "over";
export type Input = { dir: -1 | 0 | 1; /** Pointer or touch x in world units; overrides dir. */ targetX?: number };

export type World = {
  recs: Rec[];
  pegs: Peg[];
  paddle: { x: number; y: number; w: number; h: number };
  score: number;
  lives: number;
  spawnIn: number;
  nextId: number;
  over: boolean;
  /** What happened in the last step, for the live region and the drawing. Cleared every step. */
  events: GameEvent[];
  random: () => number;
};

const KINDS: Kind[] = ["null", "duplicate", "malformed"];

/** Two staggered rows of pegs: one in bronze, one in silver. */
function pegs(): Peg[] {
  const row = (y: number, offset: number) => Array.from({ length: 4 }, (_, i) => ({ x: offset + i * 90, y, r: 7 }));
  return [...row(140, 45), ...row(290, 90).filter((p) => p.x < WORLD_W - 20)];
}

export function createWorld({ seed = Date.now() }: { seed?: number } = {}): World {
  return {
    recs: [],
    pegs: pegs(),
    paddle: { x: WORLD_W / 2, y: PADDLE_Y, w: PADDLE_W, h: PADDLE_H },
    score: 0,
    lives: LIVES,
    spawnIn: 0.4,
    nextId: 1,
    over: false,
    events: [],
    random: rng(seed),
  };
}

const spawnInterval = (score: number) => Math.max(SPAWN_MIN_S, SPAWN_START_S - score * SPAWN_STEP_S);

function spawn(w: World) {
  const r = w.random;
  w.recs.push({
    id: w.nextId++,
    x: RECORD_R + r() * (WORLD_W - 2 * RECORD_R),
    y: -RECORD_R,
    vx: (r() - 0.5) * 160,
    vy: 40 + r() * 60,
    r: RECORD_R,
    kind: KINDS[Math.floor(r() * KINDS.length)],
  });
}

function movePaddle(w: World, dt: number, input: Input) {
  const p = w.paddle;
  const next = input.targetX !== undefined ? p.x + (input.targetX - p.x) * Math.min(1, POINTER_GAIN * dt) : p.x + input.dir * PADDLE_SPEED * dt;
  p.x = Math.min(WORLD_W - p.w / 2, Math.max(p.w / 2, next));
}

function bounceWalls(rec: Rec) {
  if (rec.x < rec.r) {
    rec.x = rec.r;
    rec.vx = Math.abs(rec.vx) * RESTITUTION;
  } else if (rec.x > WORLD_W - rec.r) {
    rec.x = WORLD_W - rec.r;
    rec.vx = -Math.abs(rec.vx) * RESTITUTION;
  }
}

function bouncePegs(rec: Rec, list: Peg[]) {
  for (const peg of list) {
    const dx = rec.x - peg.x;
    const dy = rec.y - peg.y;
    const min = rec.r + peg.r;
    const d2 = dx * dx + dy * dy;
    if (d2 >= min * min) continue;
    const d = Math.sqrt(d2) || 0.0001;
    const nx = dx / d;
    const ny = dy / d;
    // Push out along the normal, then reflect the normal component of the velocity.
    rec.x = peg.x + nx * min;
    rec.y = peg.y + ny * min;
    const vn = rec.vx * nx + rec.vy * ny;
    if (vn < 0) {
      rec.vx -= (1 + RESTITUTION) * vn * nx;
      rec.vy -= (1 + RESTITUTION) * vn * ny;
    }
  }
}

/** Advance the world by dt seconds. Mutates `w` (see the note at the top). */
export function step(w: World, dt: number, input: Input): World {
  w.events.length = 0;
  if (w.over) return w;
  movePaddle(w, dt, input);

  w.spawnIn -= dt;
  if (w.spawnIn <= 0) {
    spawn(w);
    w.spawnIn = spawnInterval(w.score);
  }

  const p = w.paddle;
  let kept = 0;
  for (const rec of w.recs) {
    const prevBottom = rec.y + rec.r;
    rec.vy = Math.min(MAX_FALL, rec.vy + GRAVITY * dt);
    rec.x += rec.vx * dt;
    rec.y += rec.vy * dt;
    bounceWalls(rec);
    bouncePegs(rec, w.pegs);

    const crossedTop = prevBottom <= p.y && rec.y + rec.r >= p.y;
    const overFilter = Math.abs(rec.x - p.x) <= p.w / 2 + rec.r * 0.5;
    if (crossedTop && overFilter) {
      w.score += 1;
      w.events.push("caught");
      continue;
    }
    if (rec.y - rec.r > p.y + p.h) {
      w.lives -= 1;
      w.events.push("missed");
      continue;
    }
    w.recs[kept++] = rec;
  }
  w.recs.length = kept;

  if (w.lives <= 0) {
    w.lives = 0;
    w.over = true;
    w.events.push("over");
  }
  return w;
}
