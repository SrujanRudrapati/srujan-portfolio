import Link from "next/link";
import { SceneSlot } from "@/components/three/SceneSlot";
import { SplitReveal } from "@/components/motion/SplitReveal";
import s from "../demo.module.css";

export const metadata = { title: "Lab: motion, page two" };

// The second page of the transition demo: its h1 receives focus on arrival, and its
// 3D slot reuses the same canvas the first page used.
export default function MotionLabNext() {
  return (
    <main className={s.main}>
      <header className={s.section}>
        <p className={s.label}>stage 02 / transform</p>
        <h1 className={s.h1}>Page two</h1>
        <SplitReveal as="p" by="words" className={s.lede}>
          The data line swept across to get here. Focus is on this heading, and the canvas behind the cover below is the same one.
        </SplitReveal>
        <Link href="/lab/motion" className={s.link}>
          Back to the primitives
        </Link>
      </header>
      <section className={s.section} aria-label="Surplus AI cover">
        <SceneSlot scene="surplus-line" label="Boxes and electronics ride a roller conveyor through four aluminium compute units and settle on a wooden pallet." className={s.slot} />
      </section>
    </main>
  );
}
