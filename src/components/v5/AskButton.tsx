"use client";

import { openAsk, preloadAsk } from "@/lib/ask/events";

/** Opens the "Ask about my work" panel. ⌘K / Ctrl+K reaches the palette from anywhere. */
export function AskButton({ className, label = "Ask about my work" }: { className?: string; label?: string }) {
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
      {label}
    </button>
  );
}
