"use client";

import { useRef } from "react";
import { CountUp } from "@/components/motion/CountUp";
import { HorizontalReel } from "@/components/motion/HorizontalReel";
import { Magnetic } from "@/components/motion/Magnetic";
import { Pin } from "@/components/motion/Pin";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { useScrubTimeline } from "@/components/motion/useScrubTimeline";
import { SceneSlot } from "@/components/three/SceneSlot";
import s from "./demo.module.css";

type Fig = { value: string; label: string };

/** A rail and a record: the scrub demo. The record's state follows scroll exactly (ease none). */
function ScrubDemo() {
  const ref = useRef<HTMLElement>(null);
  useScrubTimeline(ref, (tl, q) => {
    tl.fromTo(q("[data-rail-fill]"), { scaleY: 0 }, { scaleY: 1 }).fromTo(q("[data-record]"), { y: 0 }, { y: () => (q("[data-rail]")[0] as HTMLElement).offsetHeight - 16 }, 0);
  }, { start: "top 60%", end: "bottom 40%" });
  return (
    <section ref={ref} className={s.section} aria-labelledby="scrub-h">
      <p className={s.label}>ScrubTimeline</p>
      <h2 id="scrub-h" className={s.h2}>
        Scroll is the clock
      </h2>
      <div className={s.rail} data-rail aria-hidden>
        <span className={s.railFill} data-rail-fill />
        <span className={s.record} data-record />
      </div>
    </section>
  );
}

export function DemoSections({ figures, projects }: { figures: Fig[]; projects: { title: string; line: string }[] }) {
  return (
    <>
      <section className={s.section} aria-labelledby="split-h">
        <p className={s.label}>SplitReveal</p>
        <SplitReveal as="h2" id="split-h" className={s.h2}>
          I build the data layer, and the AI on top of it.
        </SplitReveal>
      </section>

      <section className={s.section} aria-labelledby="count-h">
        <p className={s.label}>CountUp</p>
        <h2 id="count-h" className={s.h2}>
          Figures arrive counting
        </h2>
        <dl className={s.figures}>
          {figures.map((f) => (
            <div key={f.label}>
              <dt>
                <CountUp value={f.value} className={s.figure} />
              </dt>
              <dd>{f.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      <ScrubDemo />

      <Pin heights={1} className={s.pinned}>
        <section className={s.section} aria-labelledby="pin-h">
          <p className={s.label}>Pin (768 px and wider)</p>
          <h2 id="pin-h" className={s.h2}>
            This stays for one screen
          </h2>
          <SceneSlot scene="label-lens" label="A medicine bottle turns under a scan line; flagged words peel off and stack into a column." className={s.slot} />
        </section>
      </Pin>

      <section className={s.sectionFlush} aria-labelledby="reel-h">
        <div className={s.section}>
          <p className={s.label}>HorizontalReel</p>
          <h2 id="reel-h" className={s.h2}>
            Sideways on desktop, swipe on phones
          </h2>
        </div>
        <HorizontalReel label="Featured projects (scrolls sideways)">
          {projects.map((p) => (
            <li key={p.title} className={s.card} data-cursor="open">
              <h3>{p.title}</h3>
              <p>{p.line}</p>
            </li>
          ))}
        </HorizontalReel>
      </section>

      <section className={s.section} aria-labelledby="mag-h">
        <p className={s.label}>Magnetic and Cursor</p>
        <h2 id="mag-h" className={s.h2}>
          Buttons lean in
        </h2>
        <Magnetic>
          <a className={s.button} href="mailto:rudrapati.srujan@gmail.com">
            Email me
          </a>
        </Magnetic>
      </section>
    </>
  );
}
