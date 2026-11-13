"use client";

import { useState } from "react";
import { LiveCard } from "./LiveCard";
import { CHIPS, LABEL, warningFor, type Allergen } from "./label-toy";
import s from "../cards.module.css";

/** Label Lens, the toy version: a warning only ever quotes the label. */
export function LabelToy() {
  const [picked, setPicked] = useState<Allergen | null>(null);
  return (
    <LiveCard label="Try it" meta="Pick an allergy">
      <p className={s.label}>
        {LABEL.map((p, i) =>
          typeof p === "string" ? (
            p
          ) : (
            <mark key={i} data-hit={picked === p.key ? "" : undefined}>
              {p.text}
            </mark>
          ),
        )}
      </p>
      <div className={s.chips} role="group" aria-label="Allergies">
        {CHIPS.map((c) => (
          <button key={c.key} type="button" className={s.btn} aria-pressed={picked === c.key} onClick={() => setPicked((p) => (p === c.key ? null : c.key))}>
            {c.label}
          </button>
        ))}
      </div>
      <p className={s.warn} aria-live="polite">
        {warningFor(picked)}
      </p>
      <small className={s.small}>A toy version with a made-up label.</small>
    </LiveCard>
  );
}
