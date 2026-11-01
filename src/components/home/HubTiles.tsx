"use client";

import Link from "next/link";
import type { PointerEvent } from "react";
import type { HubTile } from "@/data/home";
import { hubShape } from "./hub-shape";
import s from "./home.module.css";

/** The four rounded spotlight tiles (runbook v4 W2.5). Hover or focus sets the dot field's shape;
 *  the bronze light follows the pointer through two CSS variables. */
export function HubTiles({ tiles }: { tiles: HubTile[] }) {
  const spot = (e: PointerEvent<HTMLAnchorElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <ul className={s.hub} onPointerLeave={() => hubShape.set("idle")} onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && hubShape.set("idle")}>
      {tiles.map((t) => (
        <li key={t.key}>
          <Link href={t.href} className={s.tile} data-tile={t.key} onPointerMove={spot} onPointerEnter={() => hubShape.set(t.key)} onFocus={() => hubShape.set(t.key)}>
            <span className={s.tileName}>{t.name}</span>
            <span className={s.tileHint}>{t.hint}</span>
            <span className={s.tileDesc}>{t.description}</span>
            <span className={s.go} aria-hidden="true">
              <svg viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.3" fill="none">
                <path d="M1 6h10M7 2l4 4-4 4" />
              </svg>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
