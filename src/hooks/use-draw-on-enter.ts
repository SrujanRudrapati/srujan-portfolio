import { useEffect, type RefObject } from "react";

/** Where a figure counts as on screen: its top above this fraction of the viewport. The observer uses the
 *  same line (rootMargin), so a figure is never hidden while it is visible. */
const DRAW_LINE = 0.8;

/**
 * Draw-once-on-entry for project diagrams (runbook v4 W4.5). Below the line with motion allowed, the
 * figure is hidden just before it scrolls in (`data-draw="ready"`), then drawn when it crosses the line
 * (`data-draw="on"`); CSS in globals.css does the drawing. A figure already above the line at load,
 * reduced motion and a browser without IntersectionObserver keep the finished markup.
 */
export function useDrawOnEnter(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el || !("IntersectionObserver" in window)) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < innerHeight * DRAW_LINE) return;
    el.dataset.draw = "ready";
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        el.dataset.draw = "on";
        io.disconnect();
      },
      { rootMargin: `0px 0px -${Math.round((1 - DRAW_LINE) * 100)}% 0px` },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      delete el.dataset.draw;
    };
  }, [ref, enabled]);
}
