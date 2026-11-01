// Pure helpers for the looping catalogue (unit tested in carousel.test.ts).

/** Signed distance of card i from the current card on a loop of n: -1 is just left, 1 just right. */
export function loopOffset(i: number, cur: number, n: number): number {
  let d = (((i - cur) % n) + n) % n;
  if (d > n / 2) d -= n;
  return d;
}

/** A card that wraps around the loop (its offset jumps by more than one place) moves without animating. */
export function wraps(i: number, cur: number, prev: number, n: number): boolean {
  return Math.abs(loopOffset(i, cur, n) - loopOffset(i, prev, n)) > 1.5;
}

export const wrapIndex = (i: number, n: number): number => ((i % n) + n) % n;

export const DRAG_THRESHOLD_PX = 60;
export const CLICK_SLOP_PX = 8;
export const WHEEL_MIN_DELTA = 12;
export const WHEEL_LOCK_MS = 650;

/** Which way a finished drag moves the catalogue: +1 next, -1 previous, 0 stay. */
export function dragStep(dx: number): -1 | 0 | 1 {
  if (Math.abs(dx) <= DRAG_THRESHOLD_PX) return 0;
  return dx < 0 ? 1 : -1;
}

/** Which way a wheel event moves it: horizontal gestures only, one card per gesture (the caller locks). */
export function wheelStep(deltaX: number, deltaY: number): -1 | 0 | 1 {
  if (Math.abs(deltaX) <= Math.abs(deltaY) || Math.abs(deltaX) <= WHEEL_MIN_DELTA) return 0;
  return deltaX > 0 ? 1 : -1;
}
