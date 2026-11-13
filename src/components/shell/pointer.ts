// Pure helpers for the v5 "View" cursor (unit tested in pointer.test.ts).

export const CURSOR_LERP = 0.18;

/** One lerp step toward the target. */
export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

/** The selector for things the cursor grows over: links marked [data-cursor] (the giant project headings and
 *  the More projects rows). Only links, so the cursor never promises a click that does nothing. */
export const CURSOR_TARGETS = "a[data-cursor]";

/** The cursor's word over an element (its data-cursor, or "View"), or "" to hide it. */
export function cursorLabelFor(target: Element | null): string {
  const hit = target?.closest?.(CURSOR_TARGETS);
  if (!hit) return "";
  return hit.getAttribute("data-cursor") || "View";
}
