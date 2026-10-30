"use client";

import { CaretDownIcon } from "@phosphor-icons/react";
import { useState } from "react";

// Phones only (globals.css .featured-toggle / .featured-more): a featured card
// shows its title, figures and one line, and the rest opens on request. The
// toggle and the collapse exist only when JavaScript runs (html[data-js]), so
// without it everything is visible.
export function MoreToggle({ targetId, title }: { targetId: string; title: string }) {
  const [open, setOpen] = useState(false);
  const toggle = () => {
    const next = !open;
    setOpen(next);
    const el = document.getElementById(targetId);
    if (el) el.toggleAttribute("data-open", next);
  };
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={targetId}
      onClick={toggle}
      className="featured-toggle mt-6 min-h-11 items-center gap-2 text-sm font-medium text-ink underline decoration-line decoration-1 underline-offset-4"
    >
      {open ? "Hide details" : `Show details`}
      <span className="sr-only"> for {title}</span>
      <CaretDownIcon aria-hidden="true" size={16} weight="bold" className={open ? "rotate-180" : ""} />
    </button>
  );
}
