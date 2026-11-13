"use client";

import { XIcon } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { ASK_ENDPOINT, generateFor, loadIndex, retrieveAnswer, type AskResult } from "@/lib/ask/engine";
import { ASK_OPEN, ASK_PRELOAD, type AskOpenDetail } from "@/lib/ask/events";
import { MAX_QUESTION } from "@/lib/ask/limits";
import { SUGGESTIONS } from "@/lib/ask/suggestions";
import { EvidenceCard } from "./EvidenceCard";

// "Ask Srujan". A native modal <dialog> (focus stays inside, Escape closes,
// focus returns to the opener). Answers are built only from graph nodes: a
// template summary plus evidence cards, and, when the optional proxy is
// configured, a generated paragraph in which every sentence cites a card.
// The question is plain text throughout; nothing it contains is executed.

type Status = { state: "idle" } | { state: "busy" } | { state: "done"; result: AskResult } | { state: "error" };

function Suggestions({ onPick, label }: { onPick: (q: string) => void; label: string }) {
  return (
    <ul aria-label={label} className="flex flex-wrap gap-2">
      {SUGGESTIONS.map((s) => (
        <li key={s}>
          <button type="button" onClick={() => onPick(s)} className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-left text-sm text-ink transition-colors duration-300 hover:border-accent">
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
    <div aria-label="Answer" role="group" className="border-l-2 border-accent pl-4">
      <p className="text-ink">
        {result.generated.map((s, i) => (
          <span key={i}>
            {s.text}{" "}
            {s.citations.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  const card = document.getElementById(`evidence-${id}`);
                  card?.scrollIntoView({ block: "nearest" });
                  card?.focus();
                }}
                className="mr-1 text-xs font-medium text-accent underline decoration-1 underline-offset-2"
              >
                {labels.get(id) ?? id}
              </button>
            ))}{" "}
          </span>
        ))}
      </p>
    </div>
  );
}

/** The event that made AskLoader fetch this panel (it arrived before the panel existed). */
export type FirstAskEvent = { kind: "open"; question?: string; opener: HTMLElement | null } | { kind: "preload" };

export function AskPanel({ first, onReady }: { first?: FirstAskEvent | null; onReady?: () => void } = {}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState<Status>({ state: "idle" });

  const latest = useRef(0);
  const opener = useRef<HTMLElement | null>(null);
  const pressedOnBackdrop = useRef(false);

  const submit = useCallback(async (q: string) => {
    const text = q.trim().slice(0, MAX_QUESTION);
    if (!text) return;
    const id = ++latest.current;
    setQuestion(text);
    setStatus({ state: "busy" });
    try {
      const result = await retrieveAnswer(text);
      if (id !== latest.current) return;
      setStatus({ state: "done", result });
      // The generated paragraph follows the cards; a slow or failing proxy never delays them.
      if (result.kind !== "evidence" || !ASK_ENDPOINT) return;
      const generated = await generateFor(text, result.hits);
      if (id === latest.current && generated.length > 0) setStatus({ state: "done", result: { ...result, generated } });
    } catch {
      if (id === latest.current) setStatus({ state: "error" });
    }
  }, []);

  useEffect(() => {
    const open = (q: string | undefined, from: HTMLElement | null) => {
      if (!dialogRef.current?.open) {
        opener.current = from;
        dialogRef.current?.showModal();
      }
      inputRef.current?.focus();
      if (q) void submit(q);
    };
    const onOpen = (event: Event) => {
      const { question: q } = (event as CustomEvent<AskOpenDetail>).detail ?? {};
      open(q, document.activeElement instanceof HTMLElement ? document.activeElement : null);
    };
    const onPreload = () => void loadIndex().catch(() => undefined);
    window.addEventListener(ASK_OPEN, onOpen);
    window.addEventListener(ASK_PRELOAD, onPreload);
    // Replay what the loader caught before this chunk arrived, then take over listening from it.
    if (first?.kind === "open") open(first.question, first.opener);
    else if (first?.kind === "preload") onPreload();
    onReady?.();
    return () => {
      window.removeEventListener(ASK_OPEN, onOpen);
      window.removeEventListener(ASK_PRELOAD, onPreload);
    };
    // `first` is fixed once this panel mounts (the loader stops updating it when onReady fires).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submit]);

  const close = () => dialogRef.current?.close();
  // If the opener is gone (the phone menu closed behind the dialog), give focus to the menu button instead of <body>.
  // Focus goes back to the opener; if it is gone or hidden, to the bar's Search/Menu button (never <body>).
  const onClose = () => {
    const target = opener.current;
    opener.current = null;
    if (target?.isConnected && target.getClientRects().length > 0) target.focus(); // offsetParent is null in the fixed bar
    else document.querySelector<HTMLElement>("header button[aria-keyshortcuts]")?.focus();
  };

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
      onClose={onClose}
      onPointerDown={(e) => {
        pressedOnBackdrop.current = e.target === dialogRef.current;
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current && pressedOnBackdrop.current) close();
      }}
      className="m-0 h-dvh max-h-dvh w-full max-w-none bg-surface p-0 text-ink backdrop:bg-[var(--backdrop)] md:m-auto md:h-auto md:max-h-[85dvh] md:max-w-2xl md:overflow-hidden md:rounded-[28px] md:border md:border-[var(--tile-border)]"
    >
      <div className="flex h-full max-h-[inherit] flex-col">
        <header className="flex items-end justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 id="ask-title" className="[font-family:var(--serif)] font-normal tracking-[-0.02em] text-[clamp(1.75rem,5vw,2.5rem)] leading-[0.95] text-ink">
              Ask about my work
            </h2>
          </div>
          <button type="button" onClick={close} aria-label="Close" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line text-ink transition-colors duration-300 hover:border-accent">
            <XIcon aria-hidden="true" size={18} weight="bold" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">
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
              placeholder="What did you build with Spark?"
              className="min-h-11 min-w-0 flex-1 rounded-full border border-line bg-bg px-4 text-base text-ink placeholder:text-muted focus-visible:border-accent"
            />
            <button type="submit" className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-ink px-5 text-sm text-bg transition-colors duration-300 hover:bg-accent">
              Ask
            </button>
          </form>
          <p className="mt-2 text-xs text-muted">Answers come only from the projects, roles and results on this site, with links to each source.</p>

          <p className="sr-only" aria-live="polite">
            {status.state === "busy"
              ? "Searching"
              : result?.kind === "evidence"
                ? result.summary
                : result?.kind === "none"
                  ? "I don’t have anything on that."
                  : status.state === "error"
                    ? "The search could not load."
                    : ""}
          </p>
          <div aria-busy={status.state === "busy"} className="mt-6 space-y-5">
            {status.state === "idle" && <Suggestions onPick={(q) => void submit(q)} label="Suggested questions" />}
            {status.state === "busy" && <p className="text-muted">Searching…</p>}
            {status.state === "error" && <p className="text-ink">The search could not load. Check your connection and try again.</p>}
            {result?.kind === "none" && (
              <>
                <p className="text-lg text-ink">I don’t have anything on that. Try one of these:</p>
                <Suggestions onPick={(q) => void submit(q)} label="Try one of these" />
              </>
            )}
            {result?.kind === "evidence" && (
              <>
                <Generated result={result} labels={labels} />
                <p className="text-sm text-muted">{result.summary}</p>
                <ul aria-label="Evidence" className="border-b border-line">
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
