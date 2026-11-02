"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import type { WorkItem } from "@/data/work";
import { Catalogue } from "./Catalogue";
import { WorkList } from "./WorkList";
import s from "./work.module.css";

type Mode = "catalogue" | "list";
type DocWithVT = Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void>; ready: Promise<void> } };

/**
 * The Work page's two layouts and the segmented control that switches them (runbook v4 W3.1, W3.5).
 * The switch is a view transition with a shared name per project (card, art and name), so each card
 * glides into its row and back, 60 ms apart; the page root holds still. No API or reduced motion: instant.
 */
export function WorkView({ intro, items }: { intro: string; items: WorkItem[] }) {
  const featured = items.filter((p) => p.featured);
  const [mode, setMode] = useState<Mode>("catalogue");
  const [index, setIndex] = useState(0);
  const seg = useRef<HTMLDivElement>(null);

  // The white highlight sits under the pressed option (measured, so it fits any label width).
  useLayoutEffect(() => {
    const el = seg.current;
    if (!el) return;
    const place = () => {
      const on = el.querySelector<HTMLElement>('[aria-pressed="true"]');
      if (!on) return;
      el.style.setProperty("--sw", `${on.offsetWidth}px`);
      el.style.setProperty("--sx", `${on.offsetLeft - 4}px`);
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(el);
    return () => ro.disconnect();
  }, [mode]);

  const switchTo = (next: Mode) => {
    if (next === mode) return;
    const doc = document as DocWithVT;
    if (!doc.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) return setMode(next);
    const root = document.documentElement;
    root.classList.add("vt-toggle");
    const t = doc.startViewTransition(() => flushSync(() => setMode(next)));
    t.ready.catch(() => {});
    t.finished.finally(() => root.classList.remove("vt-toggle"));
  };
  const onIndex = useCallback((i: number) => setIndex(i), []);

  return (
    <>
      <div className={s.head}>
        <div>
          <h1 tabIndex={-1} className="page-title">
            Work
          </h1>
          <p className="page-intro">{intro}</p>
        </div>
        <div ref={seg} className={s.seg} role="group" aria-label="Layout">
          <button type="button" aria-pressed={mode === "catalogue"} data-layout="catalogue" onClick={() => switchTo("catalogue")}>
            Catalogue
          </button>
          <button type="button" aria-pressed={mode === "list"} data-layout="list" onClick={() => switchTo("list")}>
            List
          </button>
        </div>
      </div>
      {mode === "catalogue" ? <Catalogue items={featured} index={index} onIndex={onIndex} /> : <WorkList items={items} />}
    </>
  );
}
