"use client";

import { useCallback, useEffect, useEffectEvent, useRef, useState, useSyncExternalStore, type RefObject } from "react";

export const AUTOPLAY_MS = 5000;
export const MANUAL_HOLD_MS = 8000;

const subscribeVisibility = (cb: () => void) => {
  document.addEventListener("visibilitychange", cb);
  return () => document.removeEventListener("visibilitychange", cb);
};

/**
 * Catalogue autoplay (follow-up to runbook v4 W9): the next card every 5 s, looping. It holds while
 * the pointer is over the stage, during a gesture, on a hidden tab, off screen, and for 8 s after any
 * manual move or drag. Keyboard focus inside the catalogue pauses it until the visitor presses play
 * (APG carousel pattern), as does the pause button. The caller turns it off under reduced motion.
 */
export function useAutoplay({ enabled, index, advance, watch }: { enabled: boolean; index: number; advance: () => void; watch: RefObject<HTMLElement | null> }) {
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const [busy, setBusy] = useState(false);
  const [hold, setHold] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const hidden = useSyncExternalStore(subscribeVisibility, () => document.hidden, () => false);
  const running = enabled && !paused && !hover && !busy && !hold && onScreen && !hidden;

  // Time already spent on the current card, so a pause resumes where it stopped (as the pill does).
  const elapsed = useRef(0);
  const shown = useRef(index);
  const onDue = useEffectEvent(advance);
  useEffect(() => {
    if (shown.current !== index) {
      shown.current = index;
      elapsed.current = 0;
    }
    if (!running) return;
    const start = performance.now();
    const timer = setTimeout(onDue, Math.max(0, AUTOPLAY_MS - elapsed.current));
    return () => {
      clearTimeout(timer);
      elapsed.current += performance.now() - start;
    };
  }, [running, index]);

  useEffect(() => {
    const el = watch.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [watch]);

  const holdTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(holdTimer.current), []);
  /** A manual move: wait 8 s before moving on again. */
  const nudge = useCallback(() => {
    setHold(true);
    clearTimeout(holdTimer.current);
    holdTimer.current = setTimeout(() => setHold(false), MANUAL_HOLD_MS);
  }, []);

  return { running, paused, togglePaused: () => setPaused((p) => !p), pause: () => setPaused(true), nudge, setHover, setBusy };
}
