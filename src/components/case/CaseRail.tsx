"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { FULL, gsap, ScrollTrigger } from "@/components/motion/gsap";
import { useScrubTimeline } from "@/components/motion/useScrubTimeline";
import s from "./case.module.css";

// The case study's data path (design-direction: case studies continue the home page's rail).
// The rail fills with scroll and each section's node lights as the section arrives. Reduced
// motion: never built, so the rail stays a hairline and every node is lit (CSS).

const NODE_START = "top 60%";

export function CaseRail({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);

  useScrubTimeline(root, (tl, q) => tl.fromTo(q("[data-fill]"), { scaleY: 0 }, { scaleY: 1 }), { start: "top top", end: "bottom bottom", scrub: true });

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia(el);
    mm.add(FULL, () => {
      el.dataset.motion = "on";
      el.querySelectorAll<HTMLElement>("[data-node]").forEach((node) => {
        ScrollTrigger.create({
          trigger: node,
          start: NODE_START,
          onEnter: () => node.setAttribute("data-lit", ""),
          onLeaveBack: () => node.removeAttribute("data-lit"),
        });
      });
      return () => {
        delete el.dataset.motion;
        el.querySelectorAll("[data-node]").forEach((node) => node.removeAttribute("data-lit"));
      };
    });
    return () => mm.revert();
  }, []);

  return (
    <main id="main" ref={root} className={s.root}>
      <div className={s.rail} aria-hidden>
        <div className={s.track} />
        <div className={s.fill} data-fill />
      </div>
      {children}
    </main>
  );
}
