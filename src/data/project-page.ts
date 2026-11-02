import { caseStudy, type CaseStudy } from "./case-study.ts";
import { projects } from "./projects.ts";
import { workItems, type WorkItem } from "./work.ts";

// What one v4 project page shows (runbook v4 W4): the graph's case study, plus the Work
// catalogue's kicker and art plate, and a "next project" that loops inside its group
// (the four featured among themselves, the seven smaller ones among themselves).

/** `name` is the project's own title, the h1 a visitor lands on. */
export type ProjectNext = { slug: string; name: string };

export type ProjectPage = CaseStudy & {
  /** Featured projects get the art band; smaller ones the compact header. */
  featured: boolean;
  kicker: string;
  /** Art plate index (featured only). */
  art?: number;
  nextInGroup: ProjectNext;
};

/** The band's kicker where the catalogue's would repeat the page title. */
const BAND_KICKER: Record<string, string> = {
  // Facts 2.2: 1st place, Track 1. The title already names the hackathon.
  "devhacks-cubbie": "Cooked won first place, Track 1",
};

/** The project after `slug` in its group, wrapping to the group's first. Exported for tests. */
export function nextInGroup(items: WorkItem[], slug: string): ProjectNext {
  const self = items.find((p) => p.slug === slug);
  if (!self) throw new Error(`project-page: unknown project ${slug}`);
  const group = items.filter((p) => p.featured === self.featured);
  const i = group.indexOf(self);
  const n = group[(i + 1) % group.length];
  const title = projects.find((p) => p.slug === n.slug)?.title ?? n.name;
  return { slug: n.slug, name: title };
}

export function projectPage(slug: string): ProjectPage | undefined {
  const data = caseStudy(slug);
  if (!data) return undefined;
  const items = workItems();
  const item = items.find((p) => p.slug === slug);
  if (!item) throw new Error(`project-page: ${slug} is not in the work catalogue`);

  return {
    ...data,
    featured: item.featured,
    kicker: BAND_KICKER[slug] ?? item.kicker,
    ...(item.art !== undefined ? { art: item.art } : {}),
    nextInGroup: nextInGroup(items, slug),
  };
}
