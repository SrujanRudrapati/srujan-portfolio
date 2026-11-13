import { highlights } from "@/data/home";
import s from "../sections.module.css";

export function Highlights() {
  return (
    <ul className={`${s.strip}`} aria-label="Highlights" data-theme-tile="paper">
      {highlights.map((h) => (
        <li key={h.label}>
          <b className={s.wide}>{h.value}</b>
          {h.label}
        </li>
      ))}
    </ul>
  );
}
