"use client";

import { useState } from "react";
import { LiveCard } from "./LiveCard";
import s from "../cards.module.css";

const GOLDEN = [
  { value: "Asha Rao", from: "A" },
  { value: "asha.rao@example.com", from: "A" },
  { value: "(602) 555-0114", from: "B" },
];

/** RecordSync, the toy version: two disagreeing records merge into one, each field tagged by source. */
export function SyncToy() {
  const [merged, setMerged] = useState(false);
  return (
    <LiveCard label="Try it" meta="Two systems" className={merged ? s.merged : undefined}>
      <div className={s.recs}>
        <div className={s.rec}>
          <h4>System A</h4>
          <span>Asha Rao</span>
          <span>asha.rao@example.com</span>
          <span className={s.miss}>no phone</span>
        </div>
        <div className={s.rec}>
          <h4>System B</h4>
          <span>RAO, ASHA</span>
          <span className={s.miss}>no email</span>
          <span>(602) 555-0114</span>
        </div>
      </div>
      <div className={`${s.rec} ${s.gold}`} aria-hidden={!merged}>
        <h4>Golden record</h4>
        {GOLDEN.map((f) => (
          <p key={f.value}>
            <span>{f.value}</span>
            <i>from {f.from}</i>
          </p>
        ))}
      </div>
      <p className="sr-only" role="status">
        {merged ? "Merged into one golden record: name and email from System A, phone from System B." : ""}
      </p>
      <button type="button" className={s.btn} aria-pressed={merged} onClick={() => setMerged((m) => !m)}>
        {merged ? "Split them again" : "Match the records"}
      </button>
      <small className={s.small}>A toy version with made-up records.</small>
    </LiveCard>
  );
}
