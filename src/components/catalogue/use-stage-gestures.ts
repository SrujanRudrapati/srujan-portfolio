"use client";

import { useEffect, useEffectEvent, useRef, type RefObject } from "react";
import { GESTURE_IDLE_MS } from "./carousel";

/** Pointer movement before a press becomes a drag; below it the cards stay put for a clean click. */
const DRAG_START_PX = 6;
const LINE_PX = 16; // wheel deltaMode 1 (lines)
const FRAME_MS = 16;

export type GestureHandlers = {
  /** A drag or swipe has begun. */
  begin: () => void;
  /** The track has moved d px since it began (negative is towards the next card). */
  move: (d: number, t: number) => void;
  /** It has ended; `cancelled` when the browser or window took it away. */
  release: (velocityEnd: number, cancelled: boolean) => void;
};

/**
 * Wheel, drag and swipe on the catalogue stage (follow-up to runbook v4 W9). Returns the furthest a
 * pointer has moved since it went down, for telling a click from a drag.
 *
 * Wheel: the direction is decided by a gesture's first event and held until 120 ms without one. A
 * horizontal gesture adds up every deltaX (trackpad momentum included) and is kept from Lenis and the
 * page; a vertical one passes straight through, so a page scroll never trips a card.
 * Pointer: a press becomes a drag once it moves 6 px more sideways than down; anything else is left to
 * the page (touch-action: pan-y). A drag ends on release, on pointercancel, and if the window loses
 * focus mid-drag, so the cards can never be left stranded.
 */
export function useStageGestures(stage: RefObject<HTMLElement | null>, handlers: GestureHandlers): RefObject<number> {
  const begin = useEffectEvent(handlers.begin);
  const move = useEffectEvent(handlers.move);
  const release = useEffectEvent(handlers.release);
  const moved = useRef(0);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    let axis: "x" | "y" | null = null;
    let d = 0;
    let last = 0;
    let idle: ReturnType<typeof setTimeout> | undefined;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // pinch zoom
      if (axis === null) {
        axis = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? "x" : "y";
        if (axis === "x") {
          d = 0;
          begin();
          // The gesture starts a frame before its first event, so a single big notch (a mouse's
          // horizontal wheel) reads as a flick and moves one card.
          move(0, performance.now() - FRAME_MS);
        }
      }
      clearTimeout(idle);
      idle = setTimeout(() => {
        if (axis === "x") release(last, false);
        axis = null;
      }, GESTURE_IDLE_MS);
      if (axis === "y") return; // the page's (and Lenis's) to scroll
      e.preventDefault();
      e.stopPropagation(); // Lenis listens on window: diagonal drift must not scroll the page too
      d -= e.deltaX * (e.deltaMode === 1 ? LINE_PX : 1);
      last = performance.now();
      move(d, last);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      clearTimeout(idle);
      el.removeEventListener("wheel", onWheel);
      if (axis === "x") release(last, true);
    };
  }, [stage]);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    let press: { x: number; y: number; id: number; state: "pending" | "drag" | "page" } | null = null;
    const end = (cancelled: boolean) => {
      const p = press;
      press = null;
      if (p?.state === "drag") release(performance.now(), cancelled);
      // Cleared after the click that ends this press; after a blur the release (and its click) may
      // still come, so the count stays until the next press or key.
      if (!cancelled) setTimeout(() => (moved.current = 0), 0);
    };
    const onKey = () => (moved.current = 0); // Enter on the card is a click, whatever came before
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || !e.isPrimary) return;
      press = { x: e.clientX, y: e.clientY, id: e.pointerId, state: "pending" };
      moved.current = 0;
    };
    const onMove = (e: PointerEvent) => {
      const p = press;
      if (!p || e.pointerId !== p.id || p.state === "page") return;
      const dx = e.clientX - p.x;
      const dy = e.clientY - p.y;
      moved.current = Math.max(moved.current, Math.abs(dx));
      if (p.state === "pending") {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < DRAG_START_PX) return;
        p.state = Math.abs(dx) > Math.abs(dy) ? "drag" : "page";
        if (p.state === "page") return;
        begin();
      }
      move(dx, performance.now());
    };
    const onUp = (e: PointerEvent) => {
      if (press && e.pointerId === press.id) end(e.type === "pointercancel");
    };
    const onBlur = () => press && end(true);
    el.addEventListener("pointerdown", onDown);
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerup", onUp);
    addEventListener("pointercancel", onUp);
    addEventListener("blur", onBlur);
    addEventListener("keydown", onKey, { capture: true });
    return () => {
      removeEventListener("keydown", onKey, { capture: true });
      el.removeEventListener("pointerdown", onDown);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerup", onUp);
      removeEventListener("pointercancel", onUp);
      removeEventListener("blur", onBlur);
    };
  }, [stage]);

  return moved;
}
