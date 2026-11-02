// Pure helpers for the looping catalogue (unit tested in carousel.test.ts).

/**
 * Signed distance of card i from position pos on a loop of n: -1 is just left, 1 just right.
 * pos may be fractional (mid-slide), so the result is too.
 */
export function loopOffset(i: number, pos: number, n: number): number {
  let d = (((i - pos) % n) + n) % n;
  if (d > n / 2) d -= n;
  return d;
}

export const wrapIndex = (i: number, n: number): number => ((i % n) + n) % n;

/** A pointer that moved further than this between down and up made a drag, not a click. */
export const CLICK_SLOP_PX = 8;
/** A release advances when the gesture moved more than this share of the card width... */
export const SWIPE_FRACTION = 0.2;
/** ...or was a flick faster than this. */
export const FLICK_PX_PER_MS = 0.5;
/** A trackpad gesture (wheel events, momentum included) ends after this long without an event. */
export const GESTURE_IDLE_MS = 120;
/** Velocity is measured over the last stretch of a gesture this long. */
export const VELOCITY_WINDOW_MS = 100;
export const COMMIT_MS = 700;
export const SPRING_MS = 500;
/** 1:1 up to this share of a card step, then the track resists. */
export const RESIST_FROM = 0.75;
export const RESIST = 0.35;
/** Resting side cards are this much smaller; mid-slide cards dip a little more. */
export const SIDE_DROP = 0.06;
export const SLIDE_DIP = 0.015;
/** The art moves this percentage of its own width against the card, so it lags for depth. */
export const PARALLAX_PCT = 6.5;

/** The track never travels further than this share of a card step, however hard the swipe. */
export const RESIST_CAP = 0.95;

/**
 * Drag distance after resistance: follows the finger until most of a card, then gives way slowly
 * (starting at RESIST of the finger's speed) and never quite reaches RESIST_CAP of a step, so the
 * card after next never shows.
 */
export function resist(d: number, step: number): number {
  const free = RESIST_FROM * step;
  const room = (RESIST_CAP - RESIST_FROM) * step;
  const a = Math.abs(d);
  if (a <= free) return d;
  return Math.sign(d) * (free + room * (1 - Math.exp((-(a - free) * RESIST) / room)));
}

export type Sample = { t: number; d: number };

/** Velocity in px/ms over the samples in the window that ends at `end` (0 when there is too little). */
export function velocity(samples: readonly Sample[], end: number): number {
  const recent = samples.filter((s) => s.t >= end - VELOCITY_WINDOW_MS);
  if (recent.length < 2) return 0;
  const a = recent[0];
  const b = recent[recent.length - 1];
  return b.t > a.t ? (b.d - a.d) / (b.t - a.t) : 0;
}

/**
 * Where a released gesture goes: +1 next, -1 previous, 0 back. d is how far the track moved
 * (negative is towards the next card), v its velocity, width the card width.
 */
export function releaseStep(d: number, v: number, width: number): -1 | 0 | 1 {
  if (Math.abs(d) <= CLICK_SLOP_PX) return 0; // a press is a click or a drag, never both
  if (Math.abs(v) > FLICK_PX_PER_MS) return v < 0 ? 1 : -1;
  if (Math.abs(d) > SWIPE_FRACTION * width) return d < 0 ? 1 : -1;
  return 0;
}

/** The look of a card at offset u: smaller at the sides, a slight dip mid-slide, gone past one place. */
export function cardPose(u: number): { scale: number; opacity: number; art: number } {
  const a = Math.abs(u);
  const t = Math.min(a, 1);
  return {
    scale: 1 - SIDE_DROP * t - SLIDE_DIP * Math.sin(Math.PI * t),
    opacity: a <= 1 ? 1 : Math.max(0, 1 - (a - 1) * 2),
    art: -Math.max(-1, Math.min(1, u)) * PARALLAX_PCT,
  };
}

/** CSS cubic-bezier(x1, y1, x2, y2) as a function of progress 0..1. */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): (x: number) => number {
  const at = (a: number, b: number, t: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  const slope = (a: number, b: number, t: number) => 3 * a * (1 - t) ** 2 + 6 * (b - a) * t * (1 - t) + 3 * (1 - b) * t * t;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const dx = at(x1, x2, t) - x;
      if (Math.abs(dx) < 1e-6) break;
      const s = slope(x1, x2, t);
      if (Math.abs(s) < 1e-6) break;
      t = Math.min(1, Math.max(0, t - dx / s));
    }
    return at(y1, y2, t);
  };
}

/** The site easing, --ease in globals.css. */
export const ease = cubicBezier(0.16, 1, 0.3, 1);
