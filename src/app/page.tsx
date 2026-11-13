import type { Metadata } from "next";
import { HomePage } from "@/components/v5/home/HomePage";
import { hero } from "@/data/home";
import { jsonLdScript, personJsonLd } from "@/data/person";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta("/", "Srujan Rudrapati | Data and AI Engineer", hero.headline);

// v5: the home is the prototype's single scroll page (design/redesign.html).
export default function Page() {
  return (
    <>
      {/* Structured data for search engines; a constant built from résumé facts, escaped by jsonLdScript. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(personJsonLd()) }} />
      <HomePage />
    </>
  );
}
