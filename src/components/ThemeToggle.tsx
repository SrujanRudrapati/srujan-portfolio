"use client";

import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { useSyncExternalStore } from "react";
import { getTheme, setTheme, subscribeTheme, type Theme } from "@/lib/theme";

// On the server the theme is unknown, so the label is generic until hydration.
// Which icon shows is decided by CSS (.theme-icon-*), so the markup never mismatches.
const getServerTheme = (): Theme | null => null;

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, getTheme, getServerTheme);
  const next: Theme = theme === "dark" ? "light" : "dark";
  const label = theme ? `Switch to ${next} theme` : "Switch color theme";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={label}
      title={label}
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center border-2 border-ink text-ink transition-colors duration-150 hover:bg-ink hover:text-bg"
    >
      <SunIcon aria-hidden="true" size={18} weight="bold" className="theme-icon-sun" />
      <MoonIcon aria-hidden="true" size={18} weight="bold" className="theme-icon-moon" />
    </button>
  );
}
