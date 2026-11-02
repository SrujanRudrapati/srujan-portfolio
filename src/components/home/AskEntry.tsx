"use client";

import { openAsk, preloadAsk } from "@/lib/ask/events";

/** "Ask about my work": opens the Ask panel (runbook v4 W2.4). ⌘K / Ctrl+K still reaches it from anywhere. */
export function AskEntry({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onPointerEnter={preloadAsk}
      onFocus={preloadAsk}
      onClick={(e) => {
        e.currentTarget.focus(); // Safari does not focus a clicked button; the panel returns focus here
        openAsk();
      }}
    >
      Ask about my work
    </button>
  );
}
