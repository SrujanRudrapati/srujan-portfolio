"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { ASK_OPEN, ASK_PRELOAD, type AskOpenDetail } from "@/lib/ask/events";
import { ChunkBoundary } from "@/components/site/ChunkBoundary";
import type { FirstAskEvent } from "./AskPanel";

// Ask's panel and engine (retrieval, citations, the proxy client) are not needed until someone
// asks, so they are not in every page's first load (runbook V7: home JS budget). This loader
// listens for the same window events; the first one (open, or the preload a prompt box fires on
// focus) fetches the panel, which replays that event and then takes over listening. An open that
// arrives while the chunk is still loading replaces a preload, so nothing a visitor typed is lost.
const AskPanel = dynamic(() => import("./AskPanel").then((m) => m.AskPanel), { ssr: false });

export function AskLoader() {
  const [first, setFirst] = useState<FirstAskEvent | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return;
    const onOpen = (e: Event) => {
      const active = document.activeElement;
      setFirst({ kind: "open", question: (e as CustomEvent<AskOpenDetail>).detail?.question, opener: active instanceof HTMLElement && active !== document.body ? active : null });
    };
    const onPreload = () => setFirst((f) => f ?? { kind: "preload" });
    window.addEventListener(ASK_OPEN, onOpen);
    window.addEventListener(ASK_PRELOAD, onPreload);
    return () => {
      window.removeEventListener(ASK_OPEN, onOpen);
      window.removeEventListener(ASK_PRELOAD, onPreload);
    };
  }, [ready]);

  const onReady = useCallback(() => setReady(true), []);
  if (!first) return null;
  return (
    <ChunkBoundary message="Ask could not load. Check your connection and reload the page to try again." className="fixed inset-x-4 bottom-4 z-[90] rounded-3xl border border-[var(--tile-border)] bg-surface p-4 text-ink md:left-auto md:w-[420px]">
      <AskPanel first={first} onReady={onReady} />
    </ChunkBoundary>
  );
}
