// Theme state lives in the DOM (data-theme on <html>) and localStorage, not in
// React, so the inline script in layout.tsx and the toggle share one source.

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";
const listeners = new Set<() => void>();

const systemQuery = () => window.matchMedia("(prefers-color-scheme: dark)");

export function getTheme(): Theme {
  const stored = document.documentElement.getAttribute("data-theme");
  if (stored === "light" || stored === "dark") return stored;
  return systemQuery().matches ? "dark" : "light";
}

export function setTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage can be blocked (private mode, disabled site data). The theme still
    // applies for this page; it just will not persist.
  }
  listeners.forEach((listener) => listener());
}

export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener);
  const query = systemQuery();
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    if (event.newValue === "light" || event.newValue === "dark") {
      document.documentElement.setAttribute("data-theme", event.newValue);
    }
    listener();
  };
  query.addEventListener("change", listener);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    query.removeEventListener("change", listener);
    window.removeEventListener("storage", onStorage);
  };
}
