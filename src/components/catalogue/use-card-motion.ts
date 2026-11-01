"use client";

import { useEffect, useEffectEvent, useRef, type RefObject } from "react";
import {
  cardPose,
  COMMIT_MS,
  ease,
  loopOffset,
  releaseStep,
  resist,
  type Sample,
  velocity,
} from "./carousel";

/** The horizontal gap between cards (also in the server-rendered transform). */
export const CARD_GAP = "max(24px, 3vw)";
const GAP_PX = (vw: number) => Math.max(24, vw * 0.03);

/** Server and first-paint pose of a card at whole-number offset d (matches what paint() writes). */
export function restingStyle(d: number) {
  const { scale, opacity } = cardPose(d);
  return {
    transform: `translateX(calc(${d} * (100% + ${CARD_GAP}))) scale(${scale})`,
    opacity,
    zIndex: 10 - Math.abs(d),
  };
}

type Gesture = {
  p0: number;
  step: number;
  width: number;
  d: number;
  samples: Sample[];
};

/**
 * Drives the catalogue's cards from one continuous position (runbook v4 W3.3, follow-up to W9):
 * gestures move it 1:1, releases and index changes glide it with the site easing. Only transform
 * and opacity are written, straight to the DOM on each frame; React renders the resting pose once.
 */
export function useCardMotion(
  stage: RefObject<HTMLDivElement | null>,
  n: number,
  index: number,
  reduced: boolean,
) {
  const pos = useRef(index);
  const frame = useRef(0);
  const gesture = useRef<Gesture | null>(null);

  const paint = (p: number) => {
    const cards =
      stage.current?.querySelectorAll<HTMLElement>("[data-card-index]") ?? [];
    for (const card of cards) {
      const u = loopOffset(Number(card.dataset.cardIndex), p, n);
      const { scale, opacity, art } = cardPose(u);
      card.style.transform = `translateX(calc(${u.toFixed(4)} * (100% + ${CARD_GAP}))) scale(${scale.toFixed(4)})`;
      card.style.opacity = opacity.toFixed(3);
      card.style.zIndex = String(10 - Math.round(Math.abs(u)));
      const fill = card.querySelector<HTMLElement>("[data-art-fill]");
      if (fill) fill.style.translate = `${art.toFixed(3)}% 0`;
    }
  };

  /** Glide to card `target` the short way round the loop. */
  const settle = (target: number, ms: number) => {
    cancelAnimationFrame(frame.current);
    const from = pos.current;
    const to = from + loopOffset(target, from, n);
    const done = () => {
      pos.current = ((to % n) + n) % n;
      paint(pos.current);
    };
    if (ms <= 0 || reduced || Math.abs(to - from) < 1e-4) return done();
    const start = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / ms);
      if (k >= 1) return done();
      pos.current = from + (to - from) * ease(k);
      paint(pos.current);
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  };

  // Every index change (arrows, pills, keys, autoplay, a committed gesture) glides there.
  const glideTo = useEffectEvent((i: number) => settle(i, COMMIT_MS));
  useEffect(() => glideTo(index), [index]);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const begin = () => {
    cancelAnimationFrame(frame.current);
    const width = stage.current?.clientWidth ?? 1;
    gesture.current = {
      p0: pos.current,
      width,
      step: width + GAP_PX(innerWidth),
      d: 0,
      samples: [],
    };
  };

  /** d: how far the track has moved in px since the gesture began (negative is towards the next card). */
  const move = (d: number, t: number) => {
    const g = gesture.current;
    if (!g) return;
    g.d = d;
    g.samples = [...g.samples.filter((s) => s.t >= t - 200), { t, d }];
    pos.current = g.p0 - resist(d, g.step) / g.step;
    paint(pos.current);
  };

  /** Ends the gesture; returns where it goes. The caller changes the index, or calls springBack. */
  const end = (velocityEnd: number): -1 | 0 | 1 => {
    const g = gesture.current;
    gesture.current = null;
    if (!g) return 0;
    return releaseStep(g.d, velocity(g.samples, velocityEnd), g.width);
  };

  return { begin, move, end, settle, active: () => gesture.current !== null };
}
