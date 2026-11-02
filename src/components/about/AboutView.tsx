import Link from "next/link";
import { MedallionDiagram } from "@/components/MedallionDiagram";
import { BackPill } from "@/components/shell/BackPill";
import type { Fact } from "@/data/about";
import { withBasePath } from "@/lib/paths";
import s from "./about.module.css";

// About (runbook v4 W6): a sticky rounded portrait frame beside the letter: the statement in
// Bodoni, two short paragraphs, then the facts grid (education, certifications, every skill group).

export const PORTRAIT = "/images/portrait.jpg";

function Portrait({ hasPhoto }: { hasPhoto: boolean }) {
  if (hasPhoto) {
    return (
      <div className={s.portrait}>
        {/* eslint-disable-next-line @next/next/no-img-element -- static export, images.unoptimized */}
        <img src={withBasePath(PORTRAIT)} alt="Srujan Rudrapati" width={800} height={1000} className={s.photo} />
      </div>
    );
  }
  // Until public/images/portrait.jpg exists (DECISIONS 22): the reference's outline, decorative.
  return (
    <div className={`${s.portrait} ${s.placeholder}`} aria-hidden="true">
      <svg viewBox="0 0 100 120" fill="none" stroke="currentColor" strokeWidth="1" className={s.outline}>
        <circle cx="50" cy="38" r="22" />
        <path d="M8 118c4-30 22-44 42-44s38 14 42 44" />
      </svg>
    </div>
  );
}

export function AboutView({ statement, paragraphs, facts, hasPhoto }: { statement: string; paragraphs: string[]; facts: Fact[]; hasPhoto: boolean }) {
  return (
    <main id="main" className="page">
      <div className="wrap">
        <BackPill />
        <h1 tabIndex={-1} className="page-title">
          About
        </h1>
        <div className={s.letter}>
          <Portrait hasPhoto={hasPhoto} />
          <div>
            <p className={s.statement}>{statement}</p>
            {paragraphs.map((p) => (
              <p key={p} className={s.body}>
                {p}
              </p>
            ))}
            {/* The v3 About diagram (and the v2 hero before it), kept: the medallion architecture he builds on. Static. */}
            <figure className={s.diagram}>
              <MedallionDiagram />
              <figcaption className={s.caption}>
                Source systems feed a medallion architecture: bronze for raw data, silver for cleaned, gold for modeled. Gold feeds a serving layer, with LLMs and agents on top.
              </figcaption>
            </figure>
            <div className={s.facts}>
              {facts.map((f, i) => (
                <section key={f.heading} id={f.anchor} aria-labelledby={`fact-${i}`}>
                  <h2 id={`fact-${i}`} className={s.factHeading}>
                    {f.heading}
                  </h2>
                  {f.lines.map((line) => (
                    <p key={line} className={s.factLine}>
                      {line}
                    </p>
                  ))}
                </section>
              ))}
            </div>
            <p className={s.more}>
              <Link href="/explore#lens=skills">See where each skill was used, on the skill map</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
