import { hero } from "@/data/home";
import { Giant } from "../Giant";
import { Pin } from "../Pin";
import { Scene } from "../Art";
import s from "../sections.module.css";

export function Hero() {
  return (
    <section className={`${s.section} ${s.hero}`} id="top" data-theme="paper" data-reveal="">
      <Pin left="84%" top="10%" />
      <Pin left="10%" top="30%" />
      <div className={`${s.heroTop} ${s.mono} ${s.z}`}>
        <span>{hero.roles}</span>
        <span>{hero.place}</span>
      </div>
      <Scene name="hero" className={s.heroScene} />
      <Giant as="div" hero lines={hero.lines} name="Srujan Rudrapati">
        <Pin left="104%" top="8%" />
        <Pin left="-4%" top="55%" />
        <Pin left="104%" top="96%" />
      </Giant>
      <h1 className={`${s.h1} ${s.z}`} tabIndex={-1}>
        {hero.headline}
      </h1>
      <div className={`${s.heroSub} ${s.mono} ${s.z}`}>
        <span>{hero.availability}</span>
        <a className={s.cue} href="#work">
          {hero.cue} <span aria-hidden="true">↓</span>
        </a>
      </div>
      <Pin left="14%" top="99%" />
    </section>
  );
}
