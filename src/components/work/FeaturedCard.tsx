import { CaretDownIcon } from "@phosphor-icons/react/dist/ssr";
import type { Project } from "@/data/graph/types";
import { ProjectDiagram } from "@/components/diagrams/projectDiagrams";
import { Reveal } from "@/components/Reveal";
import { Stat } from "@/components/Stat";
import { StatusBadge, StatusNoteChip } from "@/components/StatusBadge";
import { TagList, TextLink } from "@/components/ui";
import { MoreToggle } from "./MoreToggle";

// A featured project. Order of weight: the impact figures (red, large) land
// first, then the diagram, then the prose. Everything from the old case study
// is still here; the long "How it works" block folds into a native <details>.

function Prose({ label, children }: { label: string; children: string }) {
  return (
    <div>
      <h4 className="text-ink">{label}</h4>
      <p className="mt-2 max-w-measure text-ink">{children}</p>
    </div>
  );
}

type NamedLink = "live" | "repo" | "writeup";
const linkLabels: Record<NamedLink, string> = { live: "Live app", repo: "Repository", writeup: "Write-up" };

export function FeaturedCard({ project, index }: { project: Project; index: number }) {
  const p = project;
  const titleId = `${p.slug}-title`;
  const links = (Object.keys(linkLabels) as NamedLink[]).filter((k) => p.links[k]);

  return (
    <Reveal delay={index * 80}>
      <article id={`project-${p.slug}`} aria-labelledby={titleId} className="border-t-[3px] border-ink bg-surface p-6 md:p-10">
        <header className="max-w-measure">
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted tabular-nums">
            <StatusBadge status={p.status} />
            {p.date && <span>{p.date}</span>}
            {p.context && <span>{p.context}</span>}
          </p>
          <h3 id={titleId} className="mt-3 text-2xl text-ink">
            {p.title}
          </h3>
          <p className="mt-2 text-lg text-ink">{p.oneLiner}</p>
        </header>

        {p.impact.length > 0 && (
          <ul aria-label={`${p.title} results`} className="mt-8 grid grid-cols-1 gap-x-8 gap-y-6 border-t border-line pt-6 sm:grid-cols-3">
            {p.impact.map((m) => (
              <li key={m.label}>
                <Stat value={m.value} label={m.label} stacked />
              </li>
            ))}
          </ul>
        )}

        <MoreToggle targetId={`${p.slug}-more`} title={p.title} />

        <div id={`${p.slug}-more`} className="featured-more">
          {p.diagram && (
            <div className="mt-8">
              <ProjectDiagram name={p.diagram} />
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="space-y-6 lg:col-span-7">
              {p.problem && <Prose label="Problem">{p.problem}</Prose>}
              {p.built && <Prose label="What I built">{p.built}</Prose>}
              {p.highlights.length > 0 && (
                <div>
                  <h4 className="text-ink">Highlights</h4>
                  <ul className="mt-2 max-w-measure space-y-2 text-ink">
                    {p.highlights.map((h) => (
                      <li key={h} className="border-l-2 border-line pl-3">
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="space-y-6 lg:col-span-5">
              {p.statusNotes && (
                <div>
                  <h4 className="text-ink">Status</h4>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {p.statusNotes.map((n) => (
                      <StatusNoteChip key={n.text} state={n.state}>
                        {n.text}
                      </StatusNoteChip>
                    ))}
                  </div>
                  {p.statusDetail && <p className="mt-3 max-w-measure text-sm text-muted">{p.statusDetail}</p>}
                </div>
              )}
              {p.stack.length > 0 && (
                <div>
                  <h4 className="mb-3 text-ink">Stack</h4>
                  <TagList items={p.stack} label={`${p.title} stack`} />
                </div>
              )}
              {(links.length > 0 || p.links.more) && (
                <div>
                  <h4 className="mb-3 text-ink">Links</h4>
                  <ul className="flex flex-wrap gap-x-6 gap-y-2">
                    {links.map((k) => (
                      <li key={k}>
                        <TextLink href={p.links[k]!} external className="min-h-11">
                          {k === "repo" && p.links.repoLabel ? p.links.repoLabel : linkLabels[k]}
                        </TextLink>
                      </li>
                    ))}
                    {p.links.more?.map((link) => (
                      <li key={link.url}>
                        <TextLink href={link.url} external className="min-h-11">
                          {link.label}
                        </TextLink>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {p.details && <FeaturedDetails project={p} />}
        </div>
      </article>
    </Reveal>
  );
}

// The long "How it works" block: six parts and the secondary diagrams, behind a
// native disclosure so the card stays scannable. Diagrams stack full width so
// their text keeps its size.
function FeaturedDetails({ project: p }: { project: Project }) {
  if (!p.details) return null;
  return (
    <details className="group mt-8 border-t border-line pt-4">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-2 font-display text-lg font-bold text-ink font-stretch-semi-expanded [&::-webkit-details-marker]:hidden">
        {p.details.heading}
        <CaretDownIcon aria-hidden="true" size={20} weight="bold" className="shrink-0 transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <dl className="mt-4 grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {p.details.items.map((item) => (
          <div key={item.name} className="border-t border-ink pt-4">
            <dt className="font-semibold text-ink">{item.name}</dt>
            <dd className="mt-2 text-ink">{item.text}</dd>
          </div>
        ))}
      </dl>
      {p.secondaryDiagrams && (
        <div className="mt-8 space-y-6">
          {p.secondaryDiagrams.map((name) => (
            <ProjectDiagram key={name} name={name} />
          ))}
        </div>
      )}
    </details>
  );
}
