import Link from "next/link";
import { education, experience, skillGroups, type Row } from "@/data/home";
import { Scene } from "../Art";
import { Pin } from "../Pin";
import { CertCards } from "./CertCards";
import s from "../sections.module.css";

function Rows({ rows, label }: { rows: Row[]; label: string }) {
  return (
    <ul className={`${s.rows} ${s.z}`} aria-label={label}>
      {rows.map((r) => (
        <li key={r.title + (r.when ?? "")}>
          <b>{r.title}</b>
          {r.text && <span>{r.text}</span>}
          {r.when && <em>{r.when}</em>}
        </li>
      ))}
    </ul>
  );
}

/** Skills, Experience, Education, Certified (prototype "#about"). Full detail stays on /about and /experience. */
export function About() {
  return (
    <section className={`${s.section} ${s.sect}`} id="about" data-theme="paper" data-reveal="" aria-label="About">
      <Pin left="92%" top="6%" />
      <Pin left="6%" top="50%" />
      <Pin left="90%" top="97%" />
      <div className={s.sectIn}>
        <Scene name="about" className={s.sectScene} />
        <h2 className={`${s.h2} ${s.wide} ${s.z}`}>Skills</h2>
        <div className={`${s.groups} ${s.z}`}>
          {skillGroups.map((g) => (
            <div key={g.heading}>
              <h3>{g.heading}</h3>
              <ul className={s.stack}>
                {g.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Link className={`${s.sectLink} ${s.mono} ${s.z}`} href="/about">
          All skills and the full story
        </Link>
        <h2 className={`${s.h2} ${s.wide} ${s.z}`}>Experience</h2>
        <Rows rows={experience} label="Experience" />
        <Link className={`${s.sectLink} ${s.mono} ${s.z}`} href="/experience">
          Every role on one timeline
        </Link>
        <h2 className={`${s.h2} ${s.wide} ${s.z}`}>Education</h2>
        <Rows rows={education} label="Education" />
        <h2 className={`${s.h2} ${s.wide} ${s.z}`}>Certified</h2>
        <CertCards />
      </div>
    </section>
  );
}
