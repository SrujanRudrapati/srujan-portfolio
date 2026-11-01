import Link from "next/link";
import type { ReactNode } from "react";
import { artFor } from "@/components/catalogue/art";
import { ProjectDiagram } from "@/components/diagrams/projectDiagrams";
import { BackPill } from "@/components/shell/BackPill";
import { statusLabel } from "@/data/project-helpers";
import type { NamedLink } from "@/data/case-study";
import type { ProjectPage } from "@/data/project-page";
import { withBasePath } from "@/lib/paths";
import s from "./project.module.css";

// One project page (runbook v4 W4). Featured projects open on the art band; the smaller
// ones on a compact title. Then the intro line and links, up to three results, what it
// does, the problem, how it is built (the restyled diagrams), the stack, and the next
// project in its group. Every string comes from the graph; a section with no data is left out.

function Section({ id, title, wide = false, children }: { id: string; title: string; wide?: boolean; children: ReactNode }) {
  return (
    <section className={wide ? s.sectionWide : s.section} aria-labelledby={id}>
      <h2 id={id} className={s.h2}>
        {title}
      </h2>
      <div className={s.body}>{children}</div>
    </section>
  );
}

function LinkButtons({ links, label }: { links: NamedLink[]; label: string }) {
  if (links.length === 0) return null;
  return (
    <ul className={s.links} aria-label={label}>
      {links.map((l, i) => (
        <li key={l.url}>
          <a href={l.url} target="_blank" rel="noopener noreferrer" className={i === 0 ? "btn btn-solid" : "btn"} data-magnetic>
            {l.label}
            <span className="sr-only"> (opens in a new tab)</span>
            <svg width="12" height="12" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.3" fill="none" aria-hidden="true">
              <path d="M3 9l6-6M4 3h5v5" />
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}

function Header({ data }: { data: ProjectPage }) {
  const { project: p, featured, kicker, art } = data;
  if (!featured) {
    return (
      <header className={s.compact}>
        <p className={s.compactKick}>{kicker}</p>
        <h1 tabIndex={-1} className="page-title">
          {p.title}
        </h1>
      </header>
    );
  }
  return (
    <header className={s.band}>
      <span className={s.art} style={{ background: artFor(art) }} aria-hidden="true" data-art />
      <div className={s.over}>
        <p className={s.kick}>{kicker}</p>
        <h1 tabIndex={-1} className={s.title}>
          {p.title}
        </h1>
      </div>
    </header>
  );
}

function Intro({ data, links }: { data: ProjectPage; links: NamedLink[] }) {
  const { project: p, kicker } = data;
  const running = p.status === "production" || p.status === "live";
  const meta = [p.date, p.context !== kicker ? p.context : undefined].filter((m): m is string => Boolean(m));
  return (
    <div className={s.intro}>
      <p className={s.lede}>{p.oneLiner}</p>
      <div className={s.side}>
        <p className={s.meta}>
          <span className={s.status}>
            {running && <span className={s.liveDot} aria-hidden="true" />}
            {statusLabel[p.status]}
          </span>
          {meta.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </p>
        <LinkButtons links={links} label={`${p.title} links`} />
      </div>
    </div>
  );
}

function Results({ data }: { data: ProjectPage }) {
  if (data.figures.length === 0) return null;
  return (
    <section aria-labelledby={`${data.project.slug}-results`}>
      <h2 id={`${data.project.slug}-results`} className="sr-only">
        Results
      </h2>
      <ul className={s.results}>
        {data.figures.slice(0, 3).map((f) => (
          <li key={f.summary} className={s.result} data-result>
            <p className={`metal ${s.figure}`}>{f.value}</p>
            <p className={s.figureLabel}>{f.label}</p>
            <p className={s.figureNote}>{f.summary}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Screenshot({ data }: { data: ProjectPage }) {
  const shot = data.screenshot;
  if (!shot) return null;
  return (
    <figure className={s.media}>
      <picture>
        <source media="(max-width: 767px)" srcSet={withBasePath(shot.phone.src)} width={shot.phone.width} height={shot.phone.height} />
        <img src={withBasePath(shot.wide.src)} width={shot.wide.width} height={shot.wide.height} alt={shot.alt} className={s.shot} loading="lazy" decoding="async" />
      </picture>
      <figcaption className={s.caption}>Screenshot of the live app.</figcaption>
    </figure>
  );
}

function WhatItDoes({ data }: { data: ProjectPage }) {
  const { project: p, entries } = data;
  if (!p.built && p.highlights.length === 0 && entries.length === 0 && !p.details) return null;
  return (
    <Section id={`${p.slug}-what`} title={entries.length > 0 ? "The entries" : "What it does"}>
      {p.built && <p className={s.prose}>{p.built}</p>}
      {entries.length > 0 ? (
        <ul className={s.entries}>
          {entries.map((en) => (
            <li key={en.name} className={s.entry}>
              <h3 className={s.entryName}>
                {en.name}
                {en.note && <span className={s.entryNote}>{en.note}</span>}
              </h3>
              <p className={s.entryText}>{en.text}</p>
              <LinkButtons links={en.links} label={`${en.name} links`} />
            </li>
          ))}
        </ul>
      ) : (
        p.highlights.length > 0 && (
          <ul className={s.list} aria-label={`${p.title} highlights`}>
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
  );
}

/** The problem in the project's own words, or the summary of a problem only this project solved; the named
 *  problems link to the By problem view. */
function Problem({ data }: { data: ProjectPage }) {
  const { project: p, problems } = data;
  if (!p.problem && problems.length === 0) return null;
  const prose = p.problem ? [p.problem] : problems.flatMap((x) => (x.summary ? [x.summary] : []));
  return (
    <Section id={`${p.slug}-problem`} title={prose.length > 0 ? "The problem" : problems.length > 1 ? "Problems it solved" : "Problem it solved"}>
      {prose.map((t) => (
        <p key={t} className={s.prose}>
          {t}
        </p>
      ))}
      {problems.length > 0 && (
        <ul className={s.problemTags} aria-label="Problems it solved">
          {problems.map((x) => (
            <li key={x.label}>
              <Link href="/explore#lens=problems" className="pill">
                {x.label}
                <span className="sr-only">, in the By problem view</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

function Built({ data }: { data: ProjectPage }) {
  const p = data.project;
  const diagrams = [p.diagram, ...(p.secondaryDiagrams ?? [])].filter((d): d is string => Boolean(d));
  if (diagrams.length === 0) return null;
  return (
    <Section id={`${p.slug}-built`} title="How it’s built" wide>
      <div className={s.diagrams}>
        {diagrams.map((d) => (
          <ProjectDiagram key={d} name={d} draw />
        ))}
      </div>
    </Section>
  );
}

function Stack({ data }: { data: ProjectPage }) {
  const p = data.project;
  if (p.stack.length === 0 && !p.statusNotes && !p.statusDetail && !p.credit) return null;
  return (
    <Section id={`${p.slug}-stack`} title="Stack">
      {p.stack.length > 0 && (
        <ul className={s.pills} aria-label={`${p.title} stack`}>
          {p.stack.map((t) => (
            <li key={t} className="pill">
              {t}
            </li>
          ))}
        </ul>
      )}
      {p.statusNotes && (
        <ul className={s.notes} aria-label="Status">
          {p.statusNotes.map((n) => (
            <li key={n.text} className={s.note}>
              {n.state === "running" && <span className={s.liveDot} aria-hidden="true" />}
              {n.state === "pending" && <span className={s.pendingDot} aria-hidden="true" />}
              {n.text}
            </li>
          ))}
        </ul>
      )}
      {p.statusDetail && <p className={s.small}>{p.statusDetail}</p>}
      {p.credit && <p className={s.small}>{p.credit}</p>}
    </Section>
  );
}

function Next({ data }: { data: ProjectPage }) {
  const { nextInGroup: n } = data;
  return (
    <nav className={s.nextNav} aria-label="Next project">
      <Link href={`/work/${n.slug}`} className={s.next} data-cursor="Open">
        <span>
          <small className={s.nextLabel}>Next project</small>
          <span className={s.nextName}>{n.name}</span>
        </span>
        <span className="btn" aria-hidden="true">
          Open
        </span>
      </Link>
    </nav>
  );
}

export function ProjectView({ data }: { data: ProjectPage }) {
  const entryLinks = new Set(data.entries.flatMap((en) => en.links.map((l) => l.url)));
  const links = data.links.filter((l) => !entryLinks.has(l.url));
  return (
    <main id="main" className="page">
      <div className="wrap">
        <BackPill href="/work" label="All work" />
        <Header data={data} />
        <Intro data={data} links={links} />
        <Results data={data} />
        <Screenshot data={data} />
        <WhatItDoes data={data} />
        <Problem data={data} />
        <Built data={data} />
        <Stack data={data} />
        <Next data={data} />
      </div>
    </main>
  );
}
