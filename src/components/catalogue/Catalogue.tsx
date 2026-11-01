"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { WorkItem } from "@/data/work";
import { artFor, vtNames } from "./art";
import { CLICK_SLOP_PX, dragStep, loopOffset, WHEEL_LOCK_MS, wheelStep, wrapIndex, wraps } from "./carousel";
import s from "./work.module.css";

const SIDE_SCALE = 0.94;

/**
 * The featured projects, one full card at a time, looping (runbook v4 W3.3). Drag or swipe
 * (60px), a horizontal trackpad gesture (one card each), arrow keys on the focused stage,
 * the round buttons or the pills. The front card opens its project; a side card comes forward.
 */
export function Catalogue({ items, index, onIndex }: { items: WorkItem[]; index: number; onIndex: (i: number) => void }) {
  const n = items.length;
  const stage = useRef<HTMLDivElement>(null);
  const [prev, setPrev] = useState(index);
  const [shown, setShown] = useState(index);
  const drag = useRef<{ x: number; moved: number } | null>(null);
  const moved = useRef(0);

  // Remember the previous index alongside the current one, so cards that wrap around can jump.
  if (shown !== index) {
    setPrev(shown);
    setShown(index);
  }
  const go = (i: number) => onIndex(wrapIndex(i, n));

  // Trackpad: horizontal gestures, one card per gesture (needs a non-passive listener).
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    let lock = -Infinity; // the first gesture always counts, even right after load
    const onWheel = (e: WheelEvent) => {
      const step = wheelStep(e.deltaX, e.deltaY);
      if (!step) return;
      e.preventDefault();
      const t = performance.now();
      if (t - lock > WHEEL_LOCK_MS) {
        lock = t;
        el.dispatchEvent(new CustomEvent("catalogue:step", { detail: step }));
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const onStep = (e: Event) => onIndex(wrapIndex(index + (e as CustomEvent<number>).detail, n));
    el.addEventListener("catalogue:step", onStep);
    return () => el.removeEventListener("catalogue:step", onStep);
  }, [index, n, onIndex]);

  // Drag and swipe: measured from pointerdown on the stage to pointerup anywhere.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (drag.current) drag.current.moved = Math.abs(e.clientX - drag.current.x);
    };
    const onUp = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      drag.current = null;
      moved.current = d.moved;
      const step = dragStep(e.clientX - d.x);
      if (step) stage.current?.dispatchEvent(new CustomEvent("catalogue:step", { detail: step }));
      setTimeout(() => (moved.current = 0), 0); // after the click that ends this drag
    };
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerup", onUp);
    addEventListener("pointercancel", onUp);
    return () => {
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerup", onUp);
      removeEventListener("pointercancel", onUp);
    };
  }, []);

  // Card clicks are judged on window in the capture phase, ahead of the page-transition listener
  // (document, capture): the click that ends a drag opens nothing, and a side card comes forward.
  useEffect(() => {
    const onClick = (e: globalThis.MouseEvent) => {
      const card = (e.target as Element | null)?.closest?.<HTMLElement>("[data-card-index]");
      if (!card || !stage.current?.contains(card)) return;
      const i = Number(card.dataset.cardIndex);
      if (moved.current > CLICK_SLOP_PX) e.preventDefault();
      else if (i !== index) {
        e.preventDefault();
        onIndex(i);
      }
    };
    addEventListener("click", onClick, { capture: true });
    return () => removeEventListener("click", onClick, { capture: true });
  }, [index, onIndex]);

  return (
    <>
      <div
        ref={stage}
        className={s.stage}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured projects, use the arrow keys to move"
        data-cursor="Drag"
        data-stage
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, moved: 0 };
        }}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;
          if (e.key === "ArrowRight") go(index + 1);
          else if (e.key === "ArrowLeft") go(index - 1);
          else return;
          e.preventDefault();
        }}
        onDragStart={(e) => e.preventDefault()}
      >
        {items.map((p, i) => {
          const d = loopOffset(i, index, n);
          const front = d === 0;
          const names = vtNames(i);
          return (
            <Link
              key={p.slug}
              href={`/work/${p.slug}`}
              className={s.card}
              data-front={front || undefined}
              data-jump={wraps(i, index, prev, n) || undefined}
              data-cursor={front ? "Open" : undefined}
              aria-hidden={!front}
              tabIndex={front ? 0 : -1}
              inert={!front}
              data-card-index={i}
              style={{
                transform: `translateX(calc(${d} * (100% + max(24px, 3vw)))) scale(${front ? 1 : SIDE_SCALE})`,
                opacity: Math.abs(d) > 1 ? 0 : 1,
                zIndex: 10 - Math.abs(d),
                viewTransitionName: names.item,
              }}
            >
              <span className={s.art} style={{ background: artFor(p.art), viewTransitionName: names.art }} />
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
      <div className={s.controls}>
        <span className={s.count} aria-live="polite" data-catalogue-count>
          {index + 1} of {n}
        </span>
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
    </>
  );
}
