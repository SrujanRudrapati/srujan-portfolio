import type { MetadataRoute } from "next";
import { absoluteUrl, siteRoutes } from "@/lib/site";

// Built once at export time into out/sitemap.xml (served at /srujan-portfolio/sitemap.xml). It lists
// the same routes the app generates, so it stays right when pages are added or removed.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return siteRoutes().map((route) => ({ url: absoluteUrl(route) }));
}
