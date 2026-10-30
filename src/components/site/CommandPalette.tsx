"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { appPath } from "@/components/motion/PageTransitions";
import { profile } from "@/content/profile";
import { openAsk } from "@/lib/ask/events";
import { withBasePath } from "@/lib/paths";
import { getTheme, setTheme } from "@/lib/theme";
import { isTyping, MAIN_PAGES, PALETTE_OPEN } from "./routes";

// The command palette (runbook V3): ⌘K / Ctrl+K, "/" or the nav button. A native modal
// <dialog> (focus stays inside, Escape closes, focus returns to the opener) holding a
// combobox: type to filter pages, projects and actions; arrows move, Enter runs. Anything
// typed can be asked as a question ("Ask about my work"), which opens the Ask panel with
// it; the question is plain text and never executed. Page and project items navigate by
// clicking a real link, so route transitions and focus handling apply.

export type PaletteProject = { slug: string; title: string; oneLiner: string };

type Item = { id: string; group: "Pages" | "Projects" | "Actions"; label: string; hint?: string; keywords: string; run: () => void };

function follow(path: string) {
  // Already there: a real click would reload the page (the transition skips same-page links), so
  // just return to the top and focus the page's h1.
  if (appPath(location.pathname) === appPath(path)) {
    window.scrollTo({ top: 0 });
    const h1 = document.querySelector<HTMLElement>("main h1");
    if (h1) {
      h1.tabIndex = -1;
      h1.focus();
    }
    return;
  }
  const a = document.createElement("a");
  a.href = withBasePath(path);
  a.hidden = true;
  document.body.append(a);
  a.click();
  a.remove();
}

export function CommandPalette({ projects }: { projects: PaletteProject[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const pressedOnBackdrop = useRef(false);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [note, setNote] = useState("");
  const listId = useId();

  const close = () => dialog.current?.close();

  const items = useMemo<Item[]>(() => {
    const pages: Item[] = [{ href: "/", label: "Home", key: "" }, ...MAIN_PAGES].map((p) => ({
      id: `page${p.href}`,
      group: "Pages",
      label: p.label,
      hint: p.key ? `${p.key}` : undefined,
      keywords: `${p.label} ${p.href}`,
      run: () => follow(p.href),
    }));
    const work: Item[] = projects.map((p) => ({ id: `project-${p.slug}`, group: "Projects", label: p.title, hint: p.oneLiner, keywords: `${p.title} ${p.oneLiner} ${p.slug}`, run: () => follow(`/work/${p.slug}`) }));
    const actions: Item[] = [
      {
        id: "theme",
        group: "Actions",
        label: "Toggle light and dark",
        keywords: "theme dark light mode colour color",
        run: () => setTheme(getTheme() === "dark" ? "light" : "dark"),
      },
      {
        id: "email",
        group: "Actions",
        label: "Copy email address",
        hint: profile.email,
        keywords: "email contact copy mail",
        run: () => {
          navigator.clipboard?.writeText(profile.email).then(
            () => setNote(`Copied ${profile.email}`),
            () => setNote(`Email: ${profile.email}`),
          );
        },
      },
      { id: "resume", group: "Actions", label: "Open resume (PDF)", keywords: "resume cv pdf download", run: () => window.open(withBasePath(profile.resume), "_blank", "noopener") },
    ];
    return [...pages, ...work, ...actions];
  }, [projects]);

  const q = query.trim().toLowerCase();
  const visible = useMemo(() => {
    const matched = q ? items.filter((i) => i.keywords.toLowerCase().includes(q)) : items;
    const ask: Item = {
      id: "ask",
      group: "Actions",
      label: q ? `Ask about my work: “${query.trim()}”` : "Ask about my work",
      keywords: "",
      run: () => openAsk(query.trim() || undefined),
    };
    return [...matched, ask];
  }, [items, q, query]);

  // Open from anywhere: the nav button (event), ⌘K / Ctrl+K, or "/" when not typing.
  useEffect(() => {
    const open = () => {
      const d = dialog.current;
      if (!d || d.open) return;
      setQuery("");
      setActive(0);
      setNote("");
      d.showModal();
      input.current?.focus();
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (dialog.current?.open) close();
        else open();
      } else if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey && !isTyping(e) && !document.querySelector("dialog[open]")) {
        e.preventDefault();
        open();
      }
    };
    addEventListener(PALETTE_OPEN, open);
    addEventListener("keydown", onKey);
    return () => {
      removeEventListener(PALETTE_OPEN, open);
      removeEventListener("keydown", onKey);
    };
  }, []);

  const runItem = (item: Item) => {
    if (item.id === "email") return item.run(); // stays open to show the confirmation
    close();
    item.run();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((a) => (a + step + visible.length) % visible.length);
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      setActive(e.key === "Home" ? 0 : visible.length - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = visible[Math.min(active, visible.length - 1)];
      if (item) runItem(item);
    }
  };

  const activeId = visible[Math.min(active, visible.length - 1)]?.id;
  // Keep the active option in view as the arrows move it through the scrolling list.
  useEffect(() => {
    if (activeId) document.getElementById(`${listId}-${activeId}`)?.scrollIntoView({ block: "nearest" });
  }, [activeId, listId]);
  let lastGroup = "";

  return (
    <dialog
      ref={dialog}
      aria-label="Command palette"
      // Close on a backdrop click only when the press also started there (not a drag-select out of the input).
      onPointerDown={(e) => {
        pressedOnBackdrop.current = e.target === dialog.current;
      }}
      onClick={(e) => {
        if (e.target === dialog.current && pressedOnBackdrop.current) close();
      }}
      className="m-auto mt-[12vh] w-[min(640px,calc(100vw-32px))] border-t-[3px] border-ink bg-raised p-0 text-ink backdrop:bg-black/40"
    >
      <div className="flex items-center gap-3 border-b border-line px-4">
        <span aria-hidden="true" className="font-mono text-sm text-accent-2">
          &gt;
        </span>
        <input
          ref={input}
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={activeId ? `${listId}-${activeId}` : undefined}
          aria-autocomplete="list"
          aria-label="Go to a page or project, run an action, or ask about my work"
          placeholder="Go to, or ask about my work"
          value={query}
          maxLength={300}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setNote("");
          }}
          onKeyDown={onKeyDown}
          className="h-14 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-muted"
        />
        <kbd className="font-mono text-[11px] text-muted">esc</kbd>
      </div>
      <ul id={listId} role="listbox" aria-label="Results" className="max-h-[50vh] overflow-y-auto py-2" data-lenis-prevent>
        {visible.map((item, i) => {
          const header = item.group !== lastGroup ? item.group : null;
          lastGroup = item.group;
          const selected = item.id === activeId;
          return (
            <li key={item.id} role="presentation">
              {header && (
                <p role="presentation" className="px-4 pt-3 pb-1 font-mono text-[11px] text-muted">
                  {header.toLowerCase()}
                </p>
              )}
              <div
                id={`${listId}-${item.id}`}
                role="option"
                aria-selected={selected}
                onMouseMove={() => setActive(i)}
                onClick={() => runItem(item)}
                className={`flex min-h-11 cursor-pointer items-baseline gap-3 px-4 py-2 ${selected ? "bg-ink text-bg" : "text-ink"}`}
              >
                <span className="font-medium">{item.label}</span>
                {item.hint && <span className={`truncate text-sm ${selected ? "text-bg/70" : "text-muted"}`}>{item.hint}</span>}
              </div>
            </li>
          );
        })}
      </ul>
      <p aria-live="polite" className="border-t border-line px-4 py-2 font-mono text-[11px] text-muted">
        {note || `${visible.length - 1} ${visible.length - 1 === 1 ? "match" : "matches"}, or ask`}
      </p>
    </dialog>
  );
}
