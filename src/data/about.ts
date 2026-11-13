import { certifications, education, skills } from "../content/portfolio.ts";
import { profile } from "../content/profile.ts";

// The About page (runbook v4 W6), from the profile and the graph. The statement and the two
// paragraphs are written from the facts (portfolio-facts 2.1, 2.4, 2.7; profile.status); the
// facts grid is the graph's education, certifications and every skill group, nothing dropped.

export const statement = "I like systems that hold up on a bad day: pipelines that don’t lose good data, and AI that shows its sources.";

export const paragraphs = [
  // 2.4: Celebal, Azure Databricks, healthcare, energy, manufacturing, e-commerce. 2.7: education. 2.1: production, offline.
  "I started in data engineering at Celebal Technologies, building data platforms on Azure Databricks for clients in healthcare, energy, manufacturing and e-commerce. Today I’m finishing an M.S. in Data Science, Analytics, and Engineering at Arizona State University, and running Surplus Station in production at ASU Surplus, on a small cluster of Mac minis, fully offline.",
  `I’m looking for a data or AI engineering role. ${profile.status}.`,
];

/** `anchor`: the id older links use (`/about#credentials`, `/about#skills`, from the graph and the Ask panel). */
export type Fact = { heading: string; lines: string[]; anchor?: string };

export function facts(): Fact[] {
  return [
    { heading: "Education", anchor: "credentials", lines: education.map((e) => `${e.degree}, ${e.school}. ${e.dates}, ${e.gpa}.`) },
    { heading: certifications.length > 1 ? "Certifications" : "Certification", lines: certifications.map((c) => `${c}.`) },
    ...skills.map((g, i) => ({
      heading: g.name,
      ...(i === 0 ? { anchor: "skills" } : {}),
      lines: g.items ? [`${g.items.join(", ")}.`] : (g.subgroups ?? []).map((sg) => `${sg.name}: ${sg.items.join(", ")}.`),
    })),
  ];
}
