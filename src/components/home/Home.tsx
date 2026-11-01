import type { HomeContent } from "@/data/home";
import { AskEntry } from "./AskEntry";
import { DotField } from "./DotField";
import { HubTiles } from "./HubTiles";
import s from "./home.module.css";

/** The hub (runbook v4 W2): headline, lede, now line, Ask, four tiles, and the dot field. */
export function Home({ content }: { content: HomeContent }) {
  const { headline, headlineText, lede, now, tiles } = content;
  return (
    <main id="main" className={`wrap ${s.home}`}>
      <DotField />
      <div className={s.intro}>
        {/* The lines are visual; screen readers get the sentence once. */}
        <h1 tabIndex={-1} className={s.h1}>
          <span className="sr-only">{headlineText}</span>
          {headline.map((line) => (
            <span key={line} className={s.ln} aria-hidden="true">
              <span>{line}</span>
            </span>
          ))}
        </h1>
        <p className={s.lede}>
          <strong>{lede.lead}</strong> {lede.rest}
        </p>
        <p className={s.now}>
          <span className={s.live} aria-hidden="true" />
          {now}
        </p>
        <AskEntry className={s.ask} />
      </div>
      <nav aria-label="Sections">
        <HubTiles tiles={tiles} />
      </nav>
    </main>
  );
}
