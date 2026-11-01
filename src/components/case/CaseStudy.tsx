import Link from "next/link";
import type { ReactNode } from "react";
import { ProjectDiagram } from "@/components/diagrams/projectDiagrams";
import { CountUp } from "@/components/motion/CountUp";
import { StatusBadge, StatusNoteChip } from "@/components/StatusBadge";
import { SceneSlot } from "@/components/three/SceneSlot";
import type { SceneName } from "@/components/three/scenes/names";
import type { CaseStudy as Data, NamedLink } from "@/data/case-study";
import { withBasePath } from "@/lib/paths";
import { CaseRail } from "./CaseRail";
import { NextProject } from "./NextProject";
import s from "./case.module.css";

// The case-study template (runbook V5), in the Pipeline's language: results first (output),
// then the problem (input), then the approach and the architecture (transform), then the
// stack, then the next project. Every string comes from the graph via caseStudy(); a section
// with no data is left out, which is what makes the shorter projects' pages compact.

const pad = (n: number) => String(n).padStart(2, "0");

function Section({ id, stage, title, children }: { id: string; stage: string; title: string; children: ReactNode }) {
  return (
    <section className={s.section} aria-labelledby={id}>
      <p className={s.stage}>
        <span className={s.node} data-node aria-hidden />
        {stage}
      </p>
      <h2 id={id} className={s.h2}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Links({ links, label }: { links: NamedLink[]; label: string }) {
  if (links.length === 0) return null;
  return (
    <ul className={s.links} aria-label={label}>
      {links.map((l) => (
        <li key={l.url}>
          <a href={l.url} target="_blank" rel="noopener noreferrer">
            {l.label}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function Media({ data }: { data: Data }) {
  const { screenshot, cover } = data;
  if (screenshot) {
    return (
      <figure className={s.media}>
        <picture>
          <source media="(max-width: 767px)" srcSet={withBasePath(screenshot.phone.src)} width={screenshot.phone.width} height={screenshot.phone.height} />
          <img src={withBasePath(screenshot.wide.src)} width={screenshot.wide.width} height={screenshot.wide.height} alt={screenshot.alt} className={s.shot} fetchPriority="high" />
        </picture>
        <figcaption className={s.caption}>Screenshot of the live app.</figcaption>
      </figure>
    );
  }
  if (!cover) return null;
  return (
    <div className={s.media}>
      <SceneSlot scene={cover.scene as SceneName} label={cover.label} className={s.cover} priority />
    </div>
  );
}

function ProblemTags({ problems }: { problems: Data["problems"] }) {
  return (
    <ul className={s.tags}>
      {problems.map((x) => (
        <li key={x.label}>
          <Link href="/explore#lens=problems">
            {x.label}
            <span className="sr-only">, in the By problem lens</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** The problem in the project's own words, or the summary of a problem only this project solved. When neither
 *  exists (a problem shared with other projects), the section is just the named problems, linked to the lens. */
function ProblemSection({ data }: { data: Data }) {
  const { project: p, problems } = data;
  const id = `${p.slug}-problem`;
  const prose = p.problem ? [p.problem] : problems.flatMap((x) => (x.summary ? [x.summary] : []));
  const plural = problems.length > 1 ? "Problems it solved" : "Problem it solved";
  if (prose.length === 0) {
    return (
      <Section id={id} stage="input / problem" title={plural}>
        <ProblemTags problems={problems} />
      </Section>
    );
  }
  return (
    <Section id={id} stage="input / problem" title="The problem">
      <div className={s.split}>
        <div className={s.prose}>
          {prose.map((t) => (
            <p key={t} className={s.lead}>
              {t}
            </p>
          ))}
        </div>
        {problems.length > 0 && (
          <div className={s.aside}>
            <h3 className={s.h3}>{plural}</h3>
            <ProblemTags problems={problems} />
          </div>
        )}
      </div>
    </Section>
  );
}

export function CaseStudy({ data }: { data: Data }) {
  const { project: p, figures, problems, links, entries, position, total, next } = data;
  const slug = p.slug;
  const meta = [p.date, p.context].filter(Boolean);
  const diagrams = [p.diagram, ...(p.secondaryDiagrams ?? [])].filter((d): d is string => Boolean(d));
  const hasApproach = Boolean(p.built) || p.highlights.length > 0 || entries.length > 0 || Boolean(p.details);
  const hasStack = p.stack.length > 0 || Boolean(p.statusNotes) || Boolean(p.credit);

  return (
    <CaseRail>
      <header className={s.head}>
        <p className={s.stage}>
          <span className={s.node} data-node aria-hidden />
          work / {pad(position)} of {pad(total)}
        </p>
        <h1 className={s.title}>{p.title}</h1>
        <p className={s.oneLiner}>{p.oneLiner}</p>
        <div className={s.metaRow}>
          <p className={s.meta}>
            <StatusBadge status={p.status} />
            {meta.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </p>
          <Links links={links} label={`${p.title} links`} />
        </div>
      </header>

      <Media data={data} />

      {figures.length > 0 && (
        <Section id={`${slug}-results`} stage="output / results" title="What it did">
          <ul className={s.figures}>
            {figures.map((f) => (
              <li key={f.summary} className={s.figureItem}>
                <p className={s.figure}>
                  <CountUp value={f.value} />
                </p>
                <p className={s.figureLabel}>{f.label}</p>
                <p className={s.figureSummary}>{f.summary}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {(p.problem || problems.length > 0) && <ProblemSection data={data} />}

      {hasApproach && (
        <Section id={`${slug}-approach`} stage="transform / approach" title={entries.length > 0 ? "The entries" : "What I built"}>
          {p.built && <p className={`${s.lead} ${s.prose}`}>{p.built}</p>}
          {entries.length > 0 ? (
            <ol className={s.entries}>
              {entries.map((en) => (
                <li key={en.name} className={s.entry}>
                  <h3 className={s.entryTitle}>
                    {en.name}
                    {en.note && <span className={s.entryNote}>{en.note}</span>}
                  </h3>
                  <p className={s.entryText}>{en.text}</p>
                  <Links links={en.links} label={`${en.name} links`} />
                </li>
              ))}
            </ol>
          ) : (
            p.highlights.length > 0 && (
              <ul className={s.highlights} aria-label={`${p.title} highlights`}>
                {p.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            )
          )}
          {p.details && (
            <div className={s.details}>
              <h3 className={s.h3}>{p.details.heading}</h3>
              <dl className={s.detailGrid}>
                {p.details.items.map((item) => (
                  <div key={item.name}>
                    <dt>{item.name}</dt>
                    <dd>{item.text}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </Section>
      )}

      {diagrams.length > 0 && (
        <Section id={`${slug}-architecture`} stage="transform / architecture" title="How it fits together">
          <div className={s.diagrams}>
            {diagrams.map((d) => (
              <ProjectDiagram key={d} name={d} scrub />
            ))}
          </div>
        </Section>
      )}

      {hasStack && (
        <Section id={`${slug}-stack`} stage="serve / stack" title="Stack and status">
          <div className={s.split}>
            {p.stack.length > 0 && (
              <ul className={s.chips} aria-label={`${p.title} stack`}>
                {p.stack.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            )}
            <div className={s.aside}>
              {p.statusNotes && (
                <div className={s.notes}>
                  {p.statusNotes.map((n) => (
                    <StatusNoteChip key={n.text} state={n.state}>
                      {n.text}
                    </StatusNoteChip>
                  ))}
                </div>
              )}
              {p.statusDetail && <p className={s.small}>{p.statusDetail}</p>}
              {p.credit && <p className={s.small}>{p.credit}</p>}
            </div>
          </div>
        </Section>
      )}

      <NextProject next={next} position={(position % total) + 1} total={total} />
    </CaseRail>
  );
}
