"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SHOW_ALL_PROJECTS } from "./events";
import type { Project } from "@/data/graph/types";
import { statusLabel } from "@/data/project-helpers";
import s from "./work.module.css";

// The work index (runbook V6, /explore Highlights): the four featured projects large, each with its
// catalogue art plate (v4 W7 replaced the 3D covers), then every other project as a compact row. Each item is one
// link to its case study, where the detail lives (V5). Filtering is client state only; the
// "All" view is the static HTML, so the index is complete without JavaScript. Projects and
// art plates arrive as props from the server, so the browser bundle never carries the graph.

/** Art plate (a CSS background) per featured slug. */
export type Arts = Record<string, string | undefined>;

const filters = [
  { id: "all", label: "All" },
  { id: "production", label: "Production" },
  { id: "ai", label: "AI/LLM" },
  { id: "data", label: "Data engineering" },
  { id: "hackathon", label: "Hackathon" },
] as const;

type FilterId = (typeof filters)[number]["id"];

function matches(p: Project, filter: FilterId): boolean {
  switch (filter) {
    case "all":
      return true;
    case "production":
    case "hackathon":
      return p.status === filter;
    case "ai":
    case "data":
      return p.tags.includes(filter);
  }
}

const pad = (n: number) => String(n).padStart(2, "0");

function Featured({ p, n, art }: { p: Project; n: number; art?: string }) {
  const lead = p.impact[0];
  return (
    <article id={`project-${p.slug}`} data-lens-item={`project-${p.slug}`} aria-labelledby={`${p.slug}-title`} className={s.feature}>
      <div className={s.featureText}>
        <p className={s.meta}>
          <span className={s.num}>{pad(n)}</span>
          {statusLabel[p.status].toLowerCase()}
          {p.date && <span>{p.date}</span>}
        </p>
        <h2 id={`${p.slug}-title`} className={s.featureTitle}>
          <Link href={`/work/${p.slug}`} data-cursor="Open" className={s.stretch}>
            {p.title}
          </Link>
        </h2>
        {lead && (
          <p className={s.lead}>
            <span className={s.leadValue}>{lead.value}</span>
            <span className={s.leadLabel}>{lead.label}</span>
          </p>
        )}
        <p className={s.oneLiner}>{p.oneLiner}</p>
        <p className={s.open} aria-hidden>
          Open case study
        </p>
      </div>
      {art && <span className={s.cover} style={{ background: art }} aria-hidden="true" />}
    </article>
  );
}

function Row({ p }: { p: Project }) {
  const lead = p.impact[0];
  return (
    <li id={`project-${p.slug}`} data-lens-item={`project-${p.slug}`} className={s.row}>
      <h3 className={s.rowTitle}>
        <Link href={`/work/${p.slug}`} data-cursor="Open" className={s.stretch}>
          {p.title}
        </Link>
      </h3>
      <p className={s.rowLine}>{p.oneLiner}</p>
      <p className={s.rowFigure}>
        {lead && (
          <>
            <b>{lead.value}</b> {lead.label}
          </>
        )}
      </p>
      <p className={s.rowMeta}>
        {statusLabel[p.status]}
        {p.date && <span>{p.date}</span>}
      </p>
    </li>
  );
}

export function WorkIndex({ projects, arts }: { projects: Project[]; arts: Arts }) {
  const [filter, setFilter] = useState<FilterId>("all");
  useEffect(() => {
    const showAll = () => setFilter("all");
    window.addEventListener(SHOW_ALL_PROJECTS, showAll);
    return () => window.removeEventListener(SHOW_ALL_PROJECTS, showAll);
  }, []);
  const visible = projects.filter((p) => matches(p, filter));
  const featured = visible.filter((p) => p.featured);
  const others = visible.filter((p) => !p.featured);

  return (
    <div className={s.index}>
      <div className={s.filters}>
        <ul aria-label="Filter projects" className={s.chips}>
          {filters.map((f) => (
            <li key={f.id}>
              <button type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)} className={s.chip}>
                {f.label}
              </button>
            </li>
          ))}
        </ul>
        <p aria-live="polite" className={s.count}>
          {visible.length === projects.length ? `${projects.length} projects` : `${visible.length} of ${projects.length} projects`}
        </p>
      </div>

      {visible.length === 0 && (
        <p className={s.empty}>
          Nothing matches this filter yet.{" "}
          <button type="button" onClick={() => setFilter("all")} className={s.reset}>
            Show all projects
          </button>
        </p>
      )}

      {featured.length > 0 && (
        <div className={s.featured}>
          {featured.map((p) => (
            <Featured key={p.slug} p={p} n={projects.indexOf(p) + 1} art={arts[p.slug]} />
          ))}
        </div>
      )}

      {others.length > 0 && (
        <section id="projects" aria-labelledby="other-projects" className={s.others}>
          <h2 id="other-projects" className={s.h2}>
            Other projects
          </h2>
          <ul className={s.rows}>
            {others.map((p) => (
              <Row key={p.slug} p={p} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
