import { profile } from "@/content/profile";
import type { HomeContent } from "@/data/home";
import { withBasePath } from "@/lib/paths";
import { AskEntry } from "./AskEntry";
import { DotField } from "./DotField";
import { HubTiles } from "./HubTiles";
import s from "./home.module.css";

/** The hub (runbook v4 W2): headline, lede, now line, contact links (DECISIONS 24b), Ask, four tiles, and the dot field. */
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
        <div className={s.actions}>
          <AskEntry className={s.ask} />
          {/* DECISIONS 24b: reach me without leaving the hub. Same links as Contact. */}
          <ul className={s.reach} aria-label="Contact details">
            <li>
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
            </li>
            <li>
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
            <li>
              <a href={withBasePath(profile.resume)} target="_blank" rel="noopener noreferrer">
                Resume (PDF)<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <nav aria-label="Sections">
        <HubTiles tiles={tiles} />
      </nav>
    </main>
  );
}
