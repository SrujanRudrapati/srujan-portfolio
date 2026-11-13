import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import s from "./art.module.css";

type Props = {
  /** The lines as drawn, already uppercase. */
  lines: string[];
  /** The accessible name (screen readers get this once, not the letters). */
  name: string;
  as?: "h2" | "div";
  hero?: boolean;
  /** Pins and the ghost drawing sit inside the heading, as in the prototype. */
  children?: ReactNode;
  id?: string;
  /** Makes the heading a link (the project's page); the "View" cursor shows over it. */
  href?: string;
};

/**
 * A giant woven heading. Letters alternate above (o) and below (u) the thread so the line weaves
 * through the word. Each line is fitted to the container width after load (fitGiants in Thread).
 */
export function Giant({ lines, name, as = "h2", hero, children, id, href }: Props) {
  const Tag = as;
  let n = 0;
  const words = (
    <>
      {as === "h2" && <span className="sr-only">{name}</span>}
      {lines.map((line) => (
        <span key={line} className={s.gl} data-gl="" aria-hidden="true" style={{ "--chars": line.length } as CSSProperties}>
          {[...line].map((ch, i) => {
            const cls = n++ % 2 ? s.u : s.o;
            return (
              <span key={i} className={cls} style={{ "--i": n } as CSSProperties}>
                {ch}
              </span>
            );
          })}
        </span>
      ))}
    </>
  );
  return (
    <Tag id={id} className={`${s.giant} ${hero ? s.giantHero : ""}`} data-giant={hero ? "hero" : ""} aria-hidden={as === "div" ? true : undefined}>
      {children}
      {href ? (
        <Link href={href} className={s.giantLink} data-cursor="View">
          {words}
        </Link>
      ) : (
        words
      )}
    </Tag>
  );
}
