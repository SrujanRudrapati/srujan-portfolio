import Link from "next/link";
import { moreProjects } from "@/data/home";
import { Icon } from "../Art";
import s from "../sections.module.css";

export function MoreProjects() {
  return (
    <section className={`${s.section} ${s.more}`} data-theme="paper" aria-labelledby="more-heading">
      <h2 id="more-heading" className={`${s.mono} ${s.moreHead} ${s.z}`}>
        More projects
      </h2>
      <ul className={s.moreList}>
        {moreProjects.map((p) => (
          <li key={p.slug}>
            <Link className={s.mrow} href={`/work/${p.slug}`} data-cursor="View">
              <Icon name={p.icon} />
              <b className={s.wide}>{p.name}</b>
              <span>{p.text}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link className={`${s.allLink} ${s.mono} ${s.z}`} href="/work">
        All projects
      </Link>
    </section>
  );
}
