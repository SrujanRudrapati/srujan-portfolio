import { profile } from "../content/profile.ts";
import { SITE_URL } from "../lib/site.ts";

// JSON-LD Person for the home page (schema.org). Only résumé facts (public/resume.pdf): the name, the
// summary's "Data and AI engineer", the LinkedIn and GitHub links in the header, and Education.
// The B.Tech is complete (2019 to 2023), so Rajasthan Technical University is alumniOf; the M.S. is
// expected December 2026, so Arizona State University is an affiliation, not alumniOf.

export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: "Data and AI Engineer",
    url: SITE_URL,
    sameAs: [profile.linkedin, profile.github],
    alumniOf: [
      {
        "@type": "CollegeOrUniversity",
        name: "Rajasthan Technical University",
        description: "Bachelor’s in Computer Science, graduated 2023",
      },
    ],
    affiliation: [
      {
        "@type": "CollegeOrUniversity",
        name: "Arizona State University",
        description: "Master’s in Data Science, Analytics, and Engineering, graduating December 2026",
      },
    ],
  };
}

/** The JSON for a <script type="application/ld+json">, with "<" escaped so the data can never close the tag. */
export function jsonLdScript(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
