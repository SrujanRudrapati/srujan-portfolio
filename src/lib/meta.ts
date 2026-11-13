import type { Metadata } from "next";
import { absoluteUrl } from "./site";

// Per-route metadata: each page has its own title, description, canonical URL and social card.
// URLs are absolute (from src/lib/site.ts), so they are right under the /srujan-portfolio base path
// whatever metadataBase resolves. The card image is public/og.png (1200x630), rendered by
// scripts/og-image.mts from the home page's copy.

const OG_IMAGE = {
  url: absoluteUrl("/og.png"),
  width: 1200,
  height: 630,
  type: "image/png",
  alt: "Srujan Rudrapati, data and AI engineer: I build cloud data pipelines and AI applications that run in production.",
};

export function pageMeta(path: string, title: string, description: string): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: path === "/" ? "profile" : "website", url, siteName: "Srujan Rudrapati", locale: "en_US", title, description, images: [OG_IMAGE] },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE.url] },
  };
}
