"use client";

import { ChatCircleTextIcon } from "@phosphor-icons/react";
import { openAsk } from "@/lib/ask/events";

/** Opens the Ask panel. Used in the nav bar (desktop) and the phone menu. */
export function AskButton({ className = "", onOpen }: { className?: string; onOpen?: () => void }) {
  return (
    <button
      type="button"
      onClick={() => {
        onOpen?.();
        openAsk();
      }}
      aria-haspopup="dialog"
      className={`inline-flex h-9 items-center gap-1.5 border-2 border-ink px-3 text-sm font-medium text-ink transition-colors duration-150 hover:bg-ink hover:text-bg ${className}`}
    >
      <ChatCircleTextIcon aria-hidden="true" size={16} weight="bold" />
      Ask
    </button>
  );
}
