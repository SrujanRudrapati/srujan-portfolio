import type { KeyedCard } from "@/data/graph/lenses";
import { withBasePath } from "@/lib/paths";

// By problem and By industry share one shape: a card per problem or industry,
// its summary (which carries the figure), and the projects and roles linked to it.
export function KeyedLens({ cards, noun }: { cards: KeyedCard[]; noun: string }) {
  return (
    <ul aria-label={`Work by ${noun}`} className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((c) => (
        <li key={c.id} className="flex flex-col rounded-3xl border border-[var(--tile-border)] bg-[var(--tile-bg)] p-5 md:p-6">
          <h3 className="text-lg leading-snug text-ink">{c.label}</h3>
          <p className="mt-2 text-ink">{c.summary}</p>
          <ul aria-label={`Linked to ${c.label}`} className="mt-auto space-y-2 border-t border-line pt-4 [&:not(:first-child)]:mt-5">
            {c.items.map((item) => (
              <li key={item.id} className="text-sm">
                <a href={withBasePath(item.href)} className="font-medium text-ink underline decoration-line decoration-1 underline-offset-4 hover:decoration-accent">
                  {item.title}
                </a>
                <span className="ml-2 text-xs text-muted">{item.kind === "role" ? item.line : "Project"}</span>
                {item.metric && <span className="block font-semibold text-ink tabular-nums">{item.metric}</span>}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
