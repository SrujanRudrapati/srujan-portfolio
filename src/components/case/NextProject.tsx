import Link from "next/link";
import type { NextProject as Data } from "@/data/case-study";
import { withBasePath } from "@/lib/paths";
import s from "./case.module.css";

// The bottom of every case study: one large link to the following project, so visitors keep
// moving through the work (runbook V5). On fine pointers the next project's 3D poster slides
// in on hover or focus (CSS only); the poster is decorative, the link text carries the name.

const pad = (n: number) => String(n).padStart(2, "0");

export function NextProject({ next, position, total }: { next: Data; position: number; total: number }) {
  return (
    <nav className={s.next} aria-labelledby="next-project">
      <p className={s.stage}>
        <span className={s.node} data-node aria-hidden />
        next / {pad(position)} of {pad(total)}
      </p>
      <h2 id="next-project" className="sr-only">
        Next project
      </h2>
      <Link href={`/work/${next.slug}`} className={s.nextLink} data-cursor="open">
        <span className={s.nextTitle}>{next.title}</span>
        <span className={s.nextLine}>{next.oneLiner}</span>
        {next.figure && (
          <span className={s.nextFigure}>
            <b>{next.figure.value}</b> {next.figure.label}
          </span>
        )}
        {next.poster && (
          // eslint-disable-next-line @next/next/no-img-element -- static export, images.unoptimized
          <img src={withBasePath(next.poster)} alt="" width={640} height={400} loading="lazy" decoding="async" className={s.nextPoster} />
        )}
      </Link>
      <p className={s.allWork}>
        <Link href="/work">All {total} projects</Link>
      </p>
    </nav>
  );
}
