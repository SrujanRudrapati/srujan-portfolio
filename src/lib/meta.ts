import type { Metadata } from "next";

// Per-route metadata (V3): each page is its own canonical URL with its own social card
// text. Paths are relative to metadataBase (the Pages project URL, set in the root layout),
// so "work/label-lens" resolves to https://srujanrudrapati.github.io/srujan-portfolio/work/label-lens.
export function pageMeta(path: string, title: string, description: string): Metadata {
  const url = path.replace(/^\//, "") || "./";
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, siteName: "Srujan Rudrapati", title, description, images: [{ url: "og.png", width: 1200, height: 630, alt: "Srujan Rudrapati: I build the data layer, and the AI on top of it." }] },
    twitter: { card: "summary_large_image", title, description, images: ["og.png"] },
  };
}
