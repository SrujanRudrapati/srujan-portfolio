"use client";

import { useState, type FormEvent } from "react";
import { openAsk, preloadAsk } from "@/lib/ask/events";
import { MAX_QUESTION } from "@/lib/ask/limits";

/** The small prompt box in the hero. Focus starts loading the index; submit opens the panel with the answer. */
export function HeroAsk() {
  const [q, setQ] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    openAsk(q.trim() || undefined);
    setQ("");
  };
  return (
    <form onSubmit={submit} role="search" aria-label="Ask about my work" className="flex max-w-md gap-2">
      <label htmlFor="hero-ask" className="sr-only">
        Ask about my work
      </label>
      <input
        id="hero-ask"
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={preloadAsk}
        maxLength={MAX_QUESTION}
        autoComplete="off"
        placeholder="Ask about my work…"
        className="min-h-11 min-w-0 flex-1 border-2 border-ink bg-raised px-3 text-base text-ink placeholder:text-muted"
      />
      <button type="submit" className="inline-flex min-h-11 shrink-0 items-center border-2 border-ink px-4 text-sm font-medium text-ink transition-colors duration-150 hover:bg-ink hover:text-bg">
        Ask
      </button>
    </form>
  );
}
