"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { profile } from "@/content/profile";
import { withBasePath } from "@/lib/paths";
import { ThemeToggle } from "@/components/ThemeToggle";
import { isTyping, MAIN_PAGES, openPalette } from "./routes";

// The persistent nav: name (home), the four main pages with their number keys, the
// command palette (⌘K / Ctrl+K, also a visible button for touch), and the resume one
// click away. The current page is marked with aria-current.

export function Nav() {
  const pathname = usePathname();

  // 1 to 4 jump to the main pages, unless the user is typing. A real link click, so the
  // route transition, focus and scroll handling all apply.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey || isTyping(e) || document.querySelector("dialog[open]")) return;
      const link = document.querySelector<HTMLAnchorElement>(`nav[aria-label="Main"] a[data-key="${e.key}"]`);
      if (link) {
        e.preventDefault();
        link.click();
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-line bg-bg/95 backdrop-blur-[2px] print:hidden">
      <div className="mx-auto flex h-16 max-w-page items-center gap-6 px-gutter">
        <Link href="/" aria-current={pathname === "/" ? "page" : undefined} className="inline-flex h-11 items-center font-display text-[1.375rem] leading-none font-extrabold tracking-[-0.02em] text-ink font-stretch-[62%]">
          {profile.name}
        </Link>
        <nav aria-label="Main" className="ml-auto hidden md:block">
          <ul className="flex items-center gap-1">
            {MAIN_PAGES.map((p) => {
              const current = pathname === p.href || pathname.startsWith(`${p.href}/`);
              return (
                <li key={p.href}>
                  <Link
                    href={p.href}
                    data-key={p.key}
                    aria-current={current ? "page" : undefined}
                    aria-keyshortcuts={p.key}
                    className="group inline-flex h-11 items-center gap-2 px-3 text-sm font-medium text-ink aria-[current=page]:underline aria-[current=page]:decoration-accent-2 aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-[10px] hover:text-accent-2"
                  >
                    <span aria-hidden="true" className="font-mono text-[11px] text-muted">
                      {p.key}
                    </span>
                    {p.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <a href={withBasePath(profile.resume)} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center px-2 text-sm font-medium text-ink underline decoration-1 underline-offset-4 hover:text-accent-2 sm:px-3">
            Resume
          </a>
          <span className="hidden md:inline-flex">
            <ThemeToggle />
          </span>
          <button
            type="button"
            onClick={openPalette}
            aria-keyshortcuts="Meta+K Control+K"
            className="inline-flex h-11 items-center gap-2 border border-ink px-3 text-sm font-medium text-ink transition-colors duration-150 hover:bg-ink hover:text-bg"
          >
            <span className="md:hidden">Menu</span>
            <span className="hidden md:inline">Search</span>
            <kbd aria-hidden="true" className="font-mono text-[11px] text-muted">
              ⌘K
            </kbd>
          </button>
        </div>
      </div>
    </header>
  );
}
