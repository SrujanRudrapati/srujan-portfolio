import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import type { Project } from "@/data/graph/types";
import { Card } from "@/components/Card";
import { Reveal } from "@/components/Reveal";
import { Stat } from "@/components/Stat";
import { StatusBadge } from "@/components/StatusBadge";
import { TagList } from "@/components/ui";

// Compact card for the grid. When the project has a link, the title is the one
// real anchor and its ::after covers the card, so the whole card is clickable
// with a single tab stop. Cards with nowhere to go are plain articles.

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const p = project;
  const titleId = `${p.slug}-title`;

  return (
    <Reveal delay={index * 60} className="h-full">
      <Card as="article" id={`project-${p.slug}`} aria-labelledby={titleId} lift className="group relative flex h-full flex-col">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted tabular-nums">
          <StatusBadge status={p.status} />
          {p.date && <span>{p.date}</span>}
        </p>
        <h4 id={titleId} className="mt-3 text-xl leading-snug text-ink">
          {/* The whole card opens the project's page (V3); its live, repo and write-up links are there. */}
          <Link href={`/work/${p.slug}`} data-cursor="open" className="-my-[11px] inline-block py-[11px] after:absolute after:inset-0 after:content-[''] supports-[selector(:has(a))]:focus-visible:outline-none">
            {p.title}
          </Link>
        </h4>
        {p.context && <p className="mt-1 text-xs text-muted">{p.context}</p>}
        <p className="mt-3 text-ink">{p.oneLiner}</p>

        {p.impact[0] && (
          <div className="mt-5">
            <Stat value={p.impact[0].value} label={p.impact[0].label} />
          </div>
        )}

        {p.highlights.map((h) => (
          <p key={h} className="mt-3 text-ink">
            {h}
          </p>
        ))}
        {p.credit && <p className="mt-3 text-sm text-muted">{p.credit}</p>}

        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
          <TagList items={p.stack} label={`${p.title} stack`} />
          <span
              aria-hidden="true"
              className="shrink-0 text-accent-2 motion-safe:transition-transform motion-safe:duration-150 motion-safe:ease-out-quart group-hover:translate-x-0.5 group-has-[a:focus-visible]:translate-x-0.5"
            >
              <ArrowRightIcon size={18} weight="bold" />
            </span>
        </div>
      </Card>
    </Reveal>
  );
}
