"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { DESKTOP, FULL, gsap } from "./gsap";
import { lenisStore } from "./lenis-store";
import s from "./motion.module.css";

type Props = {
  children: ReactNode;
  label: string;
  className?: string;
  /** false: pinned, the track slides to the viewport edge instead of being clipped by the section.
   *  Use it when items hold 3D covers: a WebGL view ignores CSS clipping, so clipped text and
   *  unclipped 3D would part ways. The page must clip horizontally itself (overflow-x: clip). */
  clip?: boolean;
};

/**
 * A sideways reel of items (pass <li> children). Desktop with motion: the section pins and
 * vertical scroll drives the track sideways. Phones, and reduced motion: a native
 * horizontal swipe with scroll snap, focusable so keyboard users can scroll it. Pinned, tabbing
 * to an item scrolls the page to it. A layout effect, so the pin is reverted before unmount.
 */
export function HorizontalReel({ children, label, className, clip = true }: Props) {
  const section = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLOListElement>(null);
  useLayoutEffect(() => {
    const el = section.current;
    const tr = track.current;
    if (!el || !tr) return;
    const mm = gsap.matchMedia();
    mm.add(`${FULL} and ${DESKTOP}`, () => {
      el.dataset.reel = "pinned";
      tr.tabIndex = -1; // pinned, the track scrolls with the page, so it is not a scroll container to tab to
      const distance = () => Math.max(0, tr.scrollWidth - el.clientWidth);
      const tween = gsap.to(tr, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: () => `+=${distance()}`, pin: true, scrub: 0.8, invalidateOnRefresh: true },
      });
      // Tabbing to an item off to the side: scroll the page to where the reel shows it, instead
      // of letting the browser scroll the clipped container sideways.
      const onFocus = (e: FocusEvent) => {
        const st = tween.scrollTrigger;
        const item = (e.target as Element).closest("li");
        if (!st || !item) return;
        el.scrollLeft = 0;
        const x = Math.min(distance(), Math.max(0, (item as HTMLElement).offsetLeft - 32));
        const y = st.start + (distance() ? (x / distance()) * (st.end - st.start) : 0);
        const lenis = lenisStore.get();
        if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
        else window.scrollTo(0, y);
      };
      el.addEventListener("focusin", onFocus);
      return () => {
        el.removeEventListener("focusin", onFocus);
        tween.scrollTrigger?.kill();
        tween.kill();
        tr.tabIndex = 0;
        delete el.dataset.reel;
      };
    });
    return () => mm.revert();
  }, []);
  return (
    <div ref={section} className={`${s.reel} ${className ?? ""}`} data-clip={clip ? undefined : "off"}>
      <ol ref={track} className={s.reelTrack} tabIndex={0} aria-label={label}>
        {children}
      </ol>
    </div>
  );
}
