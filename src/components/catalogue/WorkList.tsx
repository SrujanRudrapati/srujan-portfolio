import Link from "next/link";
import type { WorkItem } from "@/data/work";
import { artFor, vtNames } from "./art";
import s from "./work.module.css";

/** Rounded rows: art thumbnail, name and kicker, description and tags, key number in metal (runbook v4 W3.4). */
export function WorkList({ items }: { items: WorkItem[] }) {
  return (
    <ul className={s.list} data-work-list>
      {items.map((p, i) => {
        const names = p.featured ? vtNames(i) : null;
        return (
          <li key={p.slug}>
            <Link href={`/work/${p.slug}`} className={s.row} style={{ viewTransitionName: names?.item }}>
              <span className={s.rowArt} style={{ background: artFor(p.art), viewTransitionName: names?.art }} />
              <span>
                <span className={s.rowName} style={{ viewTransitionName: names?.name }}>
                  {p.name}
                </span>
                <span className={s.rowKick}>{p.kicker}</span>
              </span>
              <span className={s.rowText}>
                <span className={s.rowDs}>{p.description}</span>
                <span className="tags">
                  {p.tags.map((t) => (
                    <span key={t} className={`tag ${s.rowTag}`}>
                      {t}
                    </span>
                  ))}
                </span>
              </span>
              <span className={`metal ${s.rowBig}`}>{p.num}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
