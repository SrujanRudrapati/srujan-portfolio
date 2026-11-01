"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { FULL, gsap, ScrollTrigger } from "@/components/motion/gsap";
import { useScrubTimeline } from "@/components/motion/useScrubTimeline";
import s from "./rail.module.css";

// The v3 page frame (design-direction): the home page's rail continues down every other page.
// It fills with scroll and each stage label's node lights as it arrives. Reduced motion: never
// built, so the rail stays a hairline and every node is lit (CSS). RailHead and RailSection give
// a page the shared header (stage, condensed h1, intro) and section (stage, h2) in the rail's gutter.

const NODE_START = "top 60%";

export function RailPage({ children, print }: { children: ReactNode; /** data-print on main, for /cv. */ print?: string }) {
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
    <main id="main" ref={root} className={s.root} data-print={print}>
      <div className={s.rail} aria-hidden>
        <div className={s.track} />
        <div className={s.fill} data-fill />
      </div>
      {children}
    </main>
  );
}

/** A stage label with its node on the rail. */
export function Stage({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={`${s.stage} ${className ?? ""}`}>
      <span className={s.node} data-node aria-hidden />
      {children}
    </p>
  );
}

/** The page header: stage, the condensed h1 (PageTransitions focuses it), and an optional intro. */
export function RailHead({ stage, title, children }: { stage: string; title: string; children?: ReactNode }) {
  return (
    <header className={s.head}>
      <Stage>{stage}</Stage>
      <h1 className={s.title}>{title}</h1>
      {children && <div className={s.intro}>{children}</div>}
    </header>
  );
}

/** A section in the rail's gutter, with a stage label and an h2. */
export function RailSection({ id, stage, title, children, className }: { id: string; stage: string; title: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={`${s.section} ${className ?? ""}`} aria-labelledby={`${id}-title`}>
      <Stage>{stage}</Stage>
      <h2 id={`${id}-title`} className={s.h2}>
        {title}
      </h2>
      {children}
    </section>
  );
}

/** A block in the rail's gutter with no heading of its own. */
export function RailBlock({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <div id={id} className={`${s.section} ${className ?? ""}`}>
      {children}
    </div>
  );
}
