import type { TimelineEntry, TimelineProject } from "@/data/graph/lenses";
import { StatusBadge } from "@/components/StatusBadge";

// One vertical axis, newest first: roles and degrees sit on a thin cobalt
// line; projects nest under the role or degree they happened during. This is
// where the full Experience bullets live.

function NestedProject({ project: p }: { project: TimelineProject }) {
  return (
    <li className="border-t border-line pt-3">
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted tabular-nums">
        <StatusBadge status={p.status} />
        {p.date && <time dateTime={p.dateTime}>{p.date}</time>}
      </p>
      <h5 className="mt-1 font-display text-base font-semibold text-ink font-stretch-semi-expanded">
        <a href={`#project-${p.slug}`} className="underline decoration-line decoration-1 underline-offset-4 hover:decoration-accent-2">
          {p.title}
        </a>
      </h5>
      <p className="mt-1 text-sm text-ink">{p.oneLiner}</p>
      {p.impact[0] && (
        <p className="mt-1 text-sm font-semibold text-ink tabular-nums">
          {p.impact[0].value} <span className="font-normal text-muted">{p.impact[0].label}</span>
        </p>
      )}
    </li>
  );
}

function Outcomes({ outcomes }: { outcomes: TimelineEntry["outcomes"] }) {
  if (outcomes.length === 0) return null;
  const labelled = outcomes.some((o) => o.label);
  return labelled ? (
    <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 lg:grid-cols-2">
      {outcomes.map((o) => (
        <div key={o.label ?? o.text}>
          <dt className="text-sm font-semibold text-ink">{o.label}</dt>
          <dd className="mt-1 text-ink">{o.text}</dd>
        </div>
      ))}
    </dl>
  ) : (
    <ul className="mt-3 max-w-measure space-y-2">
      {outcomes.map((o) => (
        <li key={o.text} className="relative pl-4 text-ink">
          <span aria-hidden="true" className="absolute top-[0.65em] left-0 h-0.5 w-2 bg-ink" />
          {o.text}
        </li>
      ))}
    </ul>
  );
}

function Entry({ entry: e }: { entry: TimelineEntry }) {
  const marker = e.current ? "bg-accent-2" : e.kind === "undated" ? "border-2 border-dashed border-accent-2 bg-bg" : "border-2 border-accent-2 bg-bg";
  return (
    <li className="relative grid grid-cols-1 gap-x-8 gap-y-2 pb-12 pl-8 md:grid-cols-12 md:pl-0">
      <span aria-hidden="true" className={`absolute top-1.5 left-[-5px] h-3 w-3 rounded-full md:left-[calc(25%-5px)] ${marker}`} />
      <p className="text-xs font-medium text-muted tabular-nums md:col-span-3 md:pr-8 md:pt-1 md:text-right">
        {e.datesText && <time dateTime={e.dateTime}>{e.datesText}</time>}
        {e.current && <span className="mt-1 block text-accent-2">Current</span>}
      </p>
      <div className="md:col-span-9 md:pl-8">
        <h4 className="text-lg leading-snug text-ink">{e.title}</h4>
        {e.org && (
          <p className="mt-0.5 font-medium text-ink">
            {e.org}
            {e.place && <span className="font-normal text-muted">, {e.place}</span>}
          </p>
        )}
        {e.detail && <p className="mt-0.5 text-sm text-muted tabular-nums">{e.detail}</p>}
        {e.summary && <p className="mt-3 max-w-measure text-ink">{e.summary}</p>}
        <Outcomes outcomes={e.outcomes} />
        {e.projects.length > 0 && (
          <ul aria-label={`Projects during ${e.title}`} className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            {e.projects.map((p) => (
              <NestedProject key={p.slug} project={p} />
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

export function TimelineLens({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className="relative before:absolute before:top-2 before:bottom-12 before:left-0 before:w-0.5 before:bg-accent-2 md:before:left-1/4">
      {entries.map((e) => (
        <Entry key={e.id} entry={e} />
      ))}
    </ol>
  );
}
