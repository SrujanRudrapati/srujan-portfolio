"use client";

import Link from "next/link";
import { useState, useSyncExternalStore, type CSSProperties } from "react";
import { AXIS, axisPercent, dateToYear, LANE_ORDER, type TimelineItem } from "@/data/experience";
import s from "./timeline.module.css";

// The Experience chart (runbook v4 W5): a year axis, one lane per role plus Milestones, a "Today" line,
// bars that are buttons, and a detail panel under the chart that opens on the current role. The server
// HTML carries every bar and the default detail; the client only switches which item the panel shows.

const DETAIL_ID = "experience-detail";

function Bar({ item, now, selected, onSelect }: { item: TimelineItem; now: number; selected: boolean; onSelect: () => void }) {
  const left = axisPercent(item.start);
  const right = item.kind === "milestone" ? left : axisPercent(item.end ?? now);
  const style = { "--l": `${left}%`, "--w": `${right - left}%` } as CSSProperties;
  return (
    <>
      <button
        type="button"
        className={item.kind === "milestone" ? s.diamond : s.bar}
        style={style}
        aria-expanded={selected}
        aria-controls={DETAIL_ID}
        aria-label={`${item.title}, ${item.when}`}
        data-item={item.id}
        onClick={onSelect}
      >
        {item.labelSide === "in" && item.barLabel}
      </button>
      {item.labelSide !== "in" && (
        <span className={item.labelSide === "left" ? s.tagLeft : s.tagRight} style={{ "--x": `${item.labelSide === "left" ? left : right}%` } as CSSProperties} aria-hidden="true">
          {item.barLabel}
        </span>
      )}
    </>
  );
}

function Detail({ item }: { item: TimelineItem }) {
  return (
    <div id={DETAIL_ID} className={s.detail} aria-live="polite">
      <p className={s.when}>{item.when}</p>
      <div key={item.id} className={s.inner}>
        <h2 className={s.title}>{item.title}</h2>
        <p className={s.org}>
          {item.org}
          {item.place && <span className={s.place}>, {item.place}</span>}
        </p>
        {item.summary && <p className={s.summary}>{item.summary}</p>}
        {item.figures.length > 0 && (
          <ul className={s.figures} aria-label="Figures">
            {item.figures.map((f) => (
              <li key={f.value}>
                <span className={`metal ${s.figure}`}>{f.value}</span> {f.label}
              </li>
            ))}
          </ul>
        )}
        {item.outcomes.length > 0 && (
          <ul className={s.outcomes}>
            {item.outcomes.map((o) => (
              <li key={o.label ?? o.text}>
                {o.label && <span className={s.outcomeLabel}>{o.label}</span>}
                {o.text}
              </li>
            ))}
          </ul>
        )}
        {item.links.length > 0 && (
          <ul className={s.links} aria-label={item.kind === "role" ? "Built in this role" : "Read more"}>
            {item.links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="btn" data-magnetic>
                  {l.label}
                  <svg width="12" height="12" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.3" fill="none" aria-hidden="true">
                    <path d="M1 6h10M7 2l4 4-4 4" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/** The date only matters to the day, so there is nothing to subscribe to; the snapshot is stable within a day. */
const noSubscription = () => () => {};
const todayAsYear = () => dateToYear(new Date());

/** `builtAt` is the build date as a decimal year, so the server HTML and the first client render agree; the
 *  "Today" line and the current role then move to the visitor's date. */
export function Timeline({ items, defaultId, builtAt }: { items: TimelineItem[]; defaultId: string; builtAt: number }) {
  const [selectedId, setSelectedId] = useState(defaultId);
  const now = useSyncExternalStore(noSubscription, todayAsYear, () => builtAt);
  const selected = items.find((i) => i.id === selectedId) ?? items[0];
  const today = `${axisPercent(now)}%`;

  return (
    <>
      <div className={s.panel} role="region" aria-label="Timeline">
        <div className={s.chart}>
          <div className={s.axis} aria-hidden="true">
            <span />
            <div className={s.years}>
              {AXIS.years.map((y) => (
                <span key={y} style={{ "--x": `${axisPercent(y)}%` } as CSSProperties}>
                  {y}
                </span>
              ))}
            </div>
          </div>
          {LANE_ORDER.map((lane, k) => (
            <div key={lane} className={s.lane}>
              <span className={s.laneLabel}>{lane}</span>
              <div className={s.track}>
                {items
                  .filter((i) => i.lane === lane)
                  .map((i) => (
                    <Bar key={i.id} item={i} now={now} selected={i.id === selected.id} onSelect={() => setSelectedId(i.id)} />
                  ))}
                <span className={s.today} style={{ "--x": today } as CSSProperties} aria-hidden="true">
                  {k === LANE_ORDER.length - 1 && <span className={s.todayLabel}>Today</span>}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Detail item={selected} />
    </>
  );
}
