import { MAIN_PAGES } from "../components/site/routes.ts";
import { projects } from "../data/projects.ts";

// The site's public address and every indexable route, in one place: the sitemap, canonical URLs and
// Open Graph URLs all read from here, so a new page appears in all three. trailingSlash is off in
// next.config.ts, so routes have no trailing slash; only the root keeps the slash after the base path.

export const SITE_URL = "https://srujanrudrapati.github.io/srujan-portfolio/";

/** Every page that exists and should be indexed: home, the main pages, and one page per project.
 *  Left out on purpose: /work/surplus-ai (a redirect, noindex) and the 404 page. */
export function siteRoutes(): string[] {
  return ["/", ...MAIN_PAGES.map((p) => p.href), ...projects.map((p) => `/work/${p.slug}`)];
}

/** The absolute URL of a route, e.g. "/work/label-lens" → https://…/srujan-portfolio/work/label-lens. */
export function absoluteUrl(route: string): string {
  return new URL(route.replace(/^\//, ""), SITE_URL).toString();
}
