"use client";

import { useRef, type KeyboardEvent } from "react";
import { LENSES, type LensId } from "./lenses";

// Segmented control of real buttons with aria-pressed. Arrow keys, Home and
// End move to a neighbouring lens and select it. 3 by 2 on phones so every
// lens stays visible; one row from md up.
export function LensSwitcher({ lens, onChange }: { lens: LensId; onChange: (lens: LensId) => void }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = LENSES.findIndex((l) => l.id === lens);
    const last = LENSES.length - 1;
    const next =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? (current + 1) % LENSES.length
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? (current - 1 + LENSES.length) % LENSES.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    onChange(LENSES[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div role="group" aria-label="View work as" onKeyDown={onKeyDown} className="grid grid-cols-3 border-2 border-ink md:flex md:w-fit">
      {LENSES.map((l, i) => {
        const pressed = l.id === lens;
        return (
          <button
            key={l.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            aria-pressed={pressed}
            onClick={() => onChange(l.id)}
            className={`inline-flex min-h-11 items-center justify-center px-3 text-sm font-medium whitespace-nowrap transition-colors duration-150 md:px-5 [&:not(:nth-child(3n+1))]:border-l-2 [&:nth-child(n+4)]:border-t-2 md:[&:nth-child(n+4)]:border-t-0 md:[&:not(:first-child)]:border-l-2 border-ink ${
              pressed ? "bg-ink text-bg" : "text-ink hover:bg-surface"
            }`}
          >
            {l.label}
          </button>
        );
      })}
    </div>
  );
}
