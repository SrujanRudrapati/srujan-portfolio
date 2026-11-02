// Path helpers for page transitions (unit tested in route-paths.test.ts).

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** "/srujan-portfolio/work/" and "/work" compare equal: no basePath, no trailing slash. */
export function appPath(pathname: string, base = BASE): string {
  const stripped = base && (pathname === base || pathname.startsWith(`${base}/`)) ? pathname.slice(base.length) || "/" : pathname;
  return stripped.length > 1 ? stripped.replace(/\/$/, "") : stripped;
}

/** Whether a route that just arrived is the one we navigated to (path only; search and #hash ignored).
 *  Kept apart from the transition's timeout: a slow route that outlasts it still lands at the top. */
export function isPendingArrival(pending: string | null, pathname: string, base = BASE): boolean {
  return pending !== null && appPath(pending.split(/[?#]/)[0], base) === appPath(pathname, base);
}

/** The router target for an internal page link, or null for anything we should not intercept. */
export function internalTarget(a: HTMLAnchorElement): string | null {
  if (a.target && a.target !== "_self") return null;
  if (a.hasAttribute("download") || a.dataset.noTransition !== undefined || /\bexternal\b/.test(a.rel)) return null;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin) return null;
  if (/\.[a-z0-9]+$/i.test(url.pathname)) return null; // files such as /resume.pdf
  const path = appPath(url.pathname);
  if (path === appPath(location.pathname)) return null; // same page or an in-page anchor
  return path + url.search + url.hash; // router.push adds the basePath itself
}
