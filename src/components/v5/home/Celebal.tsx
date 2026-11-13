import Link from "next/link";
import { celebal } from "@/data/home";
import { Ghost } from "../Art";
import { Spread } from "../Spread";
import { Giant } from "../Giant";
import { Pin } from "../Pin";
import { Tick } from "../Tick";
import s from "../sections.module.css";

export function Celebal() {
  return (
    <section className={`${s.section} ${s.proj} ${s.flip}`} data-theme={celebal.theme} data-reveal="" aria-labelledby="celebal-heading">
      <Pin left="50%" top="2%" />
      <div className={`${s.projTop} ${s.z}`}>
        <div className={s.mono}>{celebal.kicker}</div>
        <p>{celebal.lede}</p>
      </div>
      <Spread theme={celebal.theme} captions={celebal.spread} flip />
      <Giant lines={celebal.lines} name={celebal.name} id="celebal-heading">
        <Pin left="104%" top="12%" />
        <Pin left="-4%" top="92%" />
        <Ghost name="celebal" flip />
      </Giant>
      <ul className={`${s.tiles} ${s.z}`}>
        {celebal.tiles.map((t) => (
          <li key={t.value}>
            <b className={s.wide}>{t.value}</b>
            {t.label}
          </li>
        ))}
      </ul>
      <p className={`${s.lede} ${s.z}`}>{celebal.tickLede}</p>
      <Tick perDay={celebal.recordsPerDay} className={`${s.tick} ${s.wide} ${s.z}`} />
      <div className={`${s.go} ${s.mono} ${s.z}`}>
        <Link href={celebal.link.href}>{celebal.link.label}</Link>
      </div>
      <Pin left="8%" top="97%" />
    </section>
  );
}
