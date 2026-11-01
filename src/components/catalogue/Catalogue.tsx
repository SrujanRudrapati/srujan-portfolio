"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import type { WorkItem } from "@/data/work";
import { artFor, vtNames } from "./art";
import { CLICK_SLOP_PX, loopOffset, SPRING_MS, wrapIndex } from "./carousel";
import { AUTOPLAY_MS, useAutoplay } from "./use-autoplay";
import { restingStyle, useCardMotion } from "./use-card-motion";
import { useStageGestures } from "./use-stage-gestures";
import s from "./work.module.css";

const REDUCED = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (cb: () => void) => {
  const mq = matchMedia(REDUCED);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/**
 * The featured projects, one full card at a time, looping (runbook v4 W3.3). A drag, swipe or
 * horizontal trackpad gesture moves the cards with it and commits past 20% of a card or on a flick;
 * arrow keys on the focused stage, the round buttons and the pills move one card. The front card
 * opens its project. Autoplay moves on every 5 s, with a pause button (none under reduced motion).
 */
export function Catalogue({ items, index, onIndex }: { items: WorkItem[]; index: number; onIndex: (i: number) => void }) {
  const n = items.length;
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [initial] = useState(index); // React renders the resting pose once; motion owns it after that
  const reduced = useSyncExternalStore(subscribeReduced, () => matchMedia(REDUCED).matches, () => true);
  const motion = useCardMotion(stage, n, index, reduced);
  const auto = useAutoplay({ enabled: !reduced, index, advance: () => onIndex(wrapIndex(index + 1, n)), watch: root });
  const [announced, setAnnounced] = useState("");

  const go = (i: number) => {
    const next = wrapIndex(i, n);
    auto.nudge();
    onIndex(next);
    setAnnounced(`${next + 1} of ${n}: ${items[next].name}`);
  };
  const moved = useStageGestures(stage, {
    begin: () => {
      motion.begin();
      auto.setBusy(true);
    },
    move: motion.move,
    release: (velocityEnd, cancelled) => {
      const step = motion.end(velocityEnd);
      auto.setBusy(false);
      // A cancelled gesture (the page took a vertical pan, the window lost focus) goes back.
      if (step && !cancelled) return go(index + step);
      auto.nudge(); // a drag that springs back is still a manual touch: wait before moving on
      motion.settle(index, SPRING_MS);
    },
  });

  // Card clicks are judged on window in the capture phase, ahead of the page-transition listener
  // (document, capture): a drag over 8px opens nothing.
  useEffect(() => {
    const onClick = (e: globalThis.MouseEvent) => {
      const card = (e.target as Element | null)?.closest?.<HTMLElement>("[data-card-index]");
      if (!card || !stage.current?.contains(card)) return;
      // Side cards are inert and outside the stage's clip, so only the front card can be clicked; the index check is a guard.
      if (moved.current > CLICK_SLOP_PX || Number(card.dataset.cardIndex) !== index) e.preventDefault();
    };
    addEventListener("click", onClick, { capture: true });
    return () => removeEventListener("click", onClick, { capture: true });
  }, [index, moved]);

  return (
    <div
      ref={root}
      onFocus={(e) => {
        // Keyboard focus anywhere in the catalogue stops the rotation until play is pressed.
        if ((e.target as HTMLElement).matches(":focus-visible") && !e.currentTarget.contains(e.relatedTarget as Node | null)) auto.pause();
      }}
    >
      <div
        ref={stage}
        className={s.stage}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured projects, use the arrow keys to move"
        data-cursor="Drag"
        data-stage
        data-lenis-prevent-horizontal
        onPointerEnter={(e) => e.pointerType === "mouse" && auto.setHover(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && auto.setHover(false)}
        onKeyDown={(e) => {
          // The stage itself or its front card (the only focusable card) takes the arrow keys.
          if (e.target !== e.currentTarget && !(e.target as HTMLElement).hasAttribute?.("data-front")) return;
          if (e.key === "ArrowRight") go(index + 1);
          else if (e.key === "ArrowLeft") go(index - 1);
          else return;
          e.preventDefault();
          // The focused card is about to become inert; keep focus on the stage instead of losing it.
          if (e.target !== e.currentTarget) e.currentTarget.focus();
        }}
        onDragStart={(e) => e.preventDefault()}
      >
        {items.map((p, i) => {
          const front = loopOffset(i, index, n) === 0;
          const names = vtNames(i);
          return (
            <Link
              key={p.slug}
              href={`/work/${p.slug}`}
              className={s.card}
              data-front={front || undefined}
              data-cursor={front ? "Open" : undefined}
              aria-hidden={!front}
              tabIndex={front ? 0 : -1}
              inert={!front}
              data-card-index={i}
              style={{ ...restingStyle(loopOffset(i, initial, n)), viewTransitionName: names.item }}
            >
              <span className={s.art} style={{ viewTransitionName: names.art }}>
                <span className={s.fill} data-art-fill style={{ background: artFor(p.art) }} />
              </span>
              <span className={s.shade} />
              <span className={s.top}>
                <span className={s.kick}>{p.kicker}</span>
                {p.num && (
                  <span className={s.big}>
                    {p.num}
                    <small>{p.numSub}</small>
                  </span>
                )}
              </span>
              <span className={s.bot}>
                <span className={s.nm} style={{ viewTransitionName: names.name }}>
                  {p.name}
                </span>
                <span>
                  <span className={s.ds}>{p.description}</span>
                  <span className="tags">
                    {p.tags.map((t) => (
                      <span key={t} className="tag">
                        {t}
                      </span>
                    ))}
                  </span>
                  <span className={s.open}>
                    Open the project
                    <svg width="12" height="12" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.3" fill="none" aria-hidden="true">
                      <path d="M1 6h10M7 2l4 4-4 4" />
                    </svg>
                  </span>
                </span>
              </span>
            </Link>
          );
        })}
      </div>
      <div className={s.controls} data-autoplay={auto.running ? "running" : "held"} style={{ "--autoplay": `${AUTOPLAY_MS}ms` } as CSSProperties}>
        <div className={s.status}>
          <span className={s.count} data-catalogue-count>
            {index + 1} of {n}
          </span>
          {/* Manual moves are announced; autoplay's are not, so a screen reader is not interrupted every 5 s. */}
          <span className="sr-only" role="status">
            {announced}
          </span>
          <button type="button" className={s.play} aria-label={auto.paused ? "Play slideshow" : "Pause slideshow"} data-autoplay-toggle onClick={auto.togglePaused}>
            {auto.paused ? (
              <svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
                <path d="M3 1.5v9l7.5-4.5z" />
              </svg>
            ) : (
              <svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
                <rect x="2.5" y="1.5" width="2.5" height="9" rx="0.6" />
                <rect x="7" y="1.5" width="2.5" height="9" rx="0.6" />
              </svg>
            )}
          </button>
        </div>
        <div className={s.pips}>
          {items.map((p, i) => (
            <button key={p.slug} type="button" aria-label={`Show ${p.name}`} aria-current={i === index} onClick={() => go(i)} />
          ))}
        </div>
        <div className={s.arrows}>
          <button type="button" className={s.arw} aria-label="Previous project" data-magnetic onClick={() => go(index - 1)}>
            <svg viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.4" fill="none" aria-hidden="true">
              <path d="M9 2L4 7l5 5" />
            </svg>
          </button>
          <button type="button" className={s.arw} aria-label="Next project" data-magnetic onClick={() => go(index + 1)}>
            <svg viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.4" fill="none" aria-hidden="true">
              <path d="M5 2l5 5-5 5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
