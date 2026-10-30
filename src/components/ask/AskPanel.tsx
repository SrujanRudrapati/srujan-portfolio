"use client";

import { XIcon } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { ask, loadIndex, type AskResult } from "@/lib/ask/engine";
import { ASK_OPEN, ASK_PRELOAD, type AskOpenDetail } from "@/lib/ask/events";
import { MAX_QUESTION } from "@/lib/ask/limits";
import { SUGGESTIONS } from "@/lib/ask/suggestions";
import { EvidenceCard } from "./EvidenceCard";

// "Ask Srujan". A native modal <dialog> (focus stays inside, Escape closes,
// focus returns to the opener). Answers are built only from graph nodes: a
// template summary plus evidence cards, and, when the optional proxy is
// configured, a generated paragraph in which every sentence cites a card.
// The question is plain text throughout; nothing it contains is executed.

type Status = { state: "idle" } | { state: "busy" } | { state: "done"; result: AskResult } | { state: "error"; message: string };

function Suggestions({ onPick, label }: { onPick: (q: string) => void; label: string }) {
  return (
    <ul aria-label={label} className="flex flex-wrap gap-2">
      {SUGGESTIONS.map((s) => (
        <li key={s}>
          <button type="button" onClick={() => onPick(s)} className="inline-flex min-h-11 items-center border border-line px-3 text-left text-sm text-ink transition-colors duration-150 hover:border-ink md:min-h-9">
            {s}
          </button>
        </li>
      ))}
    </ul>
  );
}

function Generated({ result, labels }: { result: Extract<AskResult, { kind: "evidence" }>; labels: Map<string, string> }) {
  if (result.generated.length === 0) return null;
  return (
    <div aria-label="Answer" role="group" className="border-l-2 border-accent-2 pl-4">
      <p className="text-ink">
        {result.generated.map((s, i) => (
          <span key={i}>
            {s.text}{" "}
            {s.citations.map((id) => (
              <a key={id} href={`#evidence-${id}`} className="mr-1 text-xs font-medium text-accent-2 underline decoration-1 underline-offset-2">
                {labels.get(id) ?? id}
              </a>
            ))}{" "}
          </span>
        ))}
      </p>
    </div>
  );
}

export function AskPanel() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState<Status>({ state: "idle" });

  const submit = useCallback(async (q: string) => {
    const text = q.trim().slice(0, MAX_QUESTION);
    if (!text) return;
    setQuestion(text);
    setStatus({ state: "busy" });
    try {
      setStatus({ state: "done", result: await ask(text) });
    } catch (error: unknown) {
      setStatus({ state: "error", message: error instanceof Error ? error.message : "Unknown error" });
    }
  }, []);

  useEffect(() => {
    const onOpen = (event: Event) => {
      const { question: q } = (event as CustomEvent<AskOpenDetail>).detail ?? {};
      if (!dialogRef.current?.open) dialogRef.current?.showModal();
      inputRef.current?.focus();
      if (q) void submit(q);
    };
    const onPreload = () => void loadIndex().catch(() => undefined);
    window.addEventListener(ASK_OPEN, onOpen);
    window.addEventListener(ASK_PRELOAD, onPreload);
    return () => {
      window.removeEventListener(ASK_OPEN, onOpen);
      window.removeEventListener(ASK_PRELOAD, onPreload);
    };
  }, [submit]);

  const close = () => dialogRef.current?.close();
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void submit(question);
  };
  const result = status.state === "done" ? status.result : null;
  const labels = new Map(result?.kind === "evidence" ? result.hits.map((h) => [h.id, h.label]) : []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="ask-title"
      onClick={(e) => e.target === dialogRef.current && close()}
      className="m-0 h-dvh max-h-dvh w-full max-w-none bg-raised p-0 text-ink backdrop:bg-ink/50 md:m-auto md:h-auto md:max-h-[85dvh] md:max-w-2xl md:border-t-[3px] md:border-ink"
    >
      <div className="flex h-full max-h-[inherit] flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <h2 id="ask-title" className="text-xl text-ink">
            Ask about my work
          </h2>
          <button type="button" onClick={close} aria-label="Close" className="inline-flex h-11 w-11 shrink-0 items-center justify-center border-2 border-ink text-ink transition-colors duration-150 hover:bg-ink hover:text-bg">
            <XIcon aria-hidden="true" size={18} weight="bold" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <form onSubmit={onSubmit} role="search" className="flex gap-2">
            <label htmlFor="ask-input" className="sr-only">
              Your question
            </label>
            <input
              ref={inputRef}
              id="ask-input"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={MAX_QUESTION}
              autoComplete="off"
              placeholder="What did he build with Spark?"
              className="min-h-11 min-w-0 flex-1 border-2 border-ink bg-bg px-3 text-base text-ink placeholder:text-muted"
            />
            <button type="submit" className="inline-flex min-h-11 shrink-0 items-center bg-ink px-4 text-sm font-medium text-bg hover:bg-accent-2">
              Ask
            </button>
          </form>
          <p className="mt-2 text-xs text-muted">Answers come only from the projects, roles and results on this site, with links to each source.</p>

          <div aria-live="polite" aria-busy={status.state === "busy"} className="mt-6 space-y-5">
            {status.state === "idle" && <Suggestions onPick={(q) => void submit(q)} label="Suggested questions" />}
            {status.state === "busy" && <p className="text-muted">Searching…</p>}
            {status.state === "error" && <p className="text-ink">The search could not load ({status.message}). Try again in a moment.</p>}
            {result?.kind === "none" && (
              <>
                <p className="text-lg text-ink">I don&apos;t have anything on that. Try one of these:</p>
                <Suggestions onPick={(q) => void submit(q)} label="Try one of these" />
              </>
            )}
            {result?.kind === "evidence" && (
              <>
                <Generated result={result} labels={labels} />
                <p className="font-medium text-ink">{result.summary}</p>
                <ul aria-label="Evidence" className="space-y-3">
                  {result.hits.map((h) => (
                    <EvidenceCard key={h.id} hit={h} onNavigate={close} />
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
}
