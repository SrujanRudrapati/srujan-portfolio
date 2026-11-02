// Pure helpers for the cursor and magnetic buttons (unit tested in pointer.test.ts).

export const CURSOR_LERP = 0.18;
export const MAGNETIC_PULL = 0.25;

/** One lerp step toward the target. */
export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

/** Offset (px) a magnetic element moves toward the pointer: 25% of the pointer's offset from its centre. */
export function magneticOffset(rect: { left: number; top: number; width: number; height: number }, x: number, y: number, pull = MAGNETIC_PULL): { dx: number; dy: number } {
  return { dx: (x - rect.left - rect.width / 2) * pull, dy: (y - rect.top - rect.height / 2) * pull };
}

export type CursorState = "" | "hover" | "label";

/** What the cursor shows over an element: a label ("Open", "Drag") from the nearest [data-cursor],
 *  a larger ring over links and buttons, or the plain ring. */
export function cursorStateFor(target: Element | null): { state: CursorState; label: string } {
  const labelled = target?.closest?.("[data-cursor]");
  const label = labelled?.getAttribute("data-cursor") ?? "";
  if (label) return { state: "label", label };
  if (target?.closest?.("a, button, [role='button'], summary, label")) return { state: "hover", label: "" };
  return { state: "", label: "" };
}
