import Link from "next/link";
import { labFacts } from "../_lib/facts";
import { DemoSections } from "./DemoSections";
import s from "./demo.module.css";

export const metadata = { title: "Lab: motion primitives" };

export default function MotionLab() {
  const f = labFacts();
  return (
    <main className={s.main}>
      <header className={s.section}>
        <p className={s.label}>stage 01 / ingest</p>
        <h1 className={s.h1}>Motion primitives</h1>
        <p className={s.lede}>Every V2 primitive on one page, with real figures. Go to the second page to see the route transition.</p>
        <Link href="/lab/motion/next" className={s.link}>
          Next page
        </Link>
      </header>
      <DemoSections figures={f.proof.map((m) => ({ value: m.value, label: m.label }))} projects={f.featured.map((p) => ({ title: p.title, line: p.oneLiner }))} />
      <footer className={s.section}>
        <Link href="/lab/motion/next" className={s.link}>
          Next page
        </Link>
      </footer>
    </main>
  );
}
