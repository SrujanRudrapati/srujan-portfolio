import Link from "next/link";
import type { HomeLink } from "@/data/home";
import s from "../sections.module.css";

/** A project's links. Internal pages use next/link; placeholders render as visible, unclickable text. */
export function Links({ links }: { links: HomeLink[] }) {
  return (
    <div className={`${s.go} ${s.mono}`}>
      {links.map((l) => {
        if ("placeholder" in l)
          return (
            <span key={l.label} className={s.todo} title={l.placeholder}>
              {l.label}: {l.placeholder.toLowerCase()}
            </span>
          );
        if (l.external)
          return (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer">
              {l.label}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          );
        return (
          <Link key={l.label} href={l.href}>
            {l.label}
          </Link>
        );
      })}
    </div>
  );
}
