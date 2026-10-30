import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { anchorFor, externalEvidence } from "@/lib/ask/answer";
import type { Hit } from "@/lib/ask/types";
import { withBasePath } from "@/lib/paths";

const TYPE_LABEL: Record<string, string> = {
  project: "Project",
  role: "Role",
  education: "Degree",
  certification: "Certification",
  skill: "Skill",
  metric: "Figure",
  industry: "Industry",
  problem: "Problem solved",
  artifact: "Link",
  event: "Event",
};

const external = (u: string) => (u.startsWith("/") ? withBasePath(u) : u);
const hostLabel = (u: string) => (u.startsWith("/") ? u.replace(/^\//, "") : new URL(u).host.replace(/^www\./, "") + new URL(u).pathname.replace(/\/$/, ""));

/** One retrieved node: label, summary, figures, a link to it on the page, and any off-page evidence. */
export function EvidenceCard({ hit, onNavigate }: { hit: Hit; onNavigate: () => void }) {
  const figures = hit.metrics ? hit.metrics.split("; ") : [];
  const links = externalEvidence(hit);
  return (
    <li id={`evidence-${hit.id}`} tabIndex={-1} className="scroll-mt-4 border-t-[3px] border-ink bg-surface p-4">
      <p className="text-xs font-medium text-muted">{TYPE_LABEL[hit.type] ?? hit.type}</p>
      <h3 className="mt-1 font-display text-base font-semibold text-ink font-stretch-semi-expanded">
        <a
          href={withBasePath(anchorFor(hit))}
          // A page on the site: the Ask panel closes and the route transition takes over
          // (it scrolls to any #anchor and moves focus there).
          onClick={onNavigate}
          className="underline decoration-line decoration-1 underline-offset-4 hover:decoration-accent-2"
        >
          {hit.label}
        </a>
      </h3>
      <p className="mt-1.5 text-ink">{hit.summary}</p>
      {figures.length > 0 && (
        <ul aria-label={`${hit.label} figures`} className="mt-2 space-y-0.5">
          {figures.map((f) => (
            <li key={f} className="text-sm font-semibold text-ink tabular-nums">
              {f}
            </li>
          ))}
        </ul>
      )}
      {links.length > 0 && (
        <ul aria-label={`${hit.label} links`} className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {links.map((u) => (
            <li key={u}>
              <a href={external(u)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-accent-2 underline decoration-1 underline-offset-4 hover:text-accent-2-hover">
                {hostLabel(u)}
                <ArrowUpRightIcon aria-hidden="true" size={12} weight="bold" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
