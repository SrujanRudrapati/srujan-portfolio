import type { LensItem } from "@/data/graph/lenses";
import { withBasePath } from "@/lib/paths";

// Projects and roles as single lines: title (the link), kind, one line, lead figure.
export function LensItemList({ items, label }: { items: LensItem[]; label: string }) {
  return (
    <ul aria-label={label} className="divide-y divide-line border-y border-line">
      {items.map((item) => (
        <li key={item.id} className="grid grid-cols-1 gap-x-6 gap-y-1 py-3 md:grid-cols-12">
          <p className="md:col-span-5">
            <a href={withBasePath(item.href)} className="font-medium text-ink underline decoration-line decoration-1 underline-offset-4 hover:decoration-accent-2">
              {item.title}
            </a>
            <span className="ml-2 text-xs text-muted">{item.kind === "role" ? "Role" : "Project"}</span>
          </p>
          <p className="text-ink md:col-span-4">{item.line}</p>
          {item.metric && <p className="text-sm font-semibold text-ink tabular-nums md:col-span-3">{item.metric}</p>}
        </li>
      ))}
    </ul>
  );
}
