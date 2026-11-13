import { projects, type Project } from "./projects.ts";

// The Work page's catalogue and list (runbook v4 W3), built from the graph's projects.
// Featured copy follows the approved reference where it matches portfolio-facts; markers
// ("~", "about") are kept and dashes are written out ("4 to 9 s"), per the copy rules.

export type WorkItem = {
  slug: string;
  name: string;
  kicker: string;
  /** Key number (Bodoni on cards, metal in the list) and its sublabel. Empty when the data has none. */
  num?: string;
  numSub?: string;
  description: string;
  tags: string[];
  featured: boolean;
  /** Index into the art plates (featured only). */
  art?: number;
};

type FeaturedCopy = Omit<WorkItem, "slug" | "featured" | "art">;

/** Catalogue order (runbook W3.2): Surplus Station, Label Lens, Cooked (DevHacks × Cubbie), Watchtower. */
const FEATURED: Record<string, FeaturedCopy> = {
  // Facts 2.1: about 15 min to about 3 min per item; offline; identifies, grades, prices, labels; bulk listings automated.
  "surplus-station": {
    name: "Surplus Station",
    kicker: "In production at ASU Surplus",
    num: "~15 → ~3 min",
    numSub: "processing time per item",
    description: "Offline AI that identifies, grades, prices and labels surplus items.",
    tags: ["Production", "Local LLMs", "MLX", "Automation"],
  },
  // Facts 2.3: live app; warnings quote the label word for word; 16 s to 4 to 9 s; 56 + 6 tests.
  "label-lens": {
    name: "Label Lens",
    kicker: "Live web app",
    num: "16 s → 4 to 9 s",
    numSub: "response time",
    description: "Photograph a label; get allergy and medication warnings that quote it word for word.",
    tags: ["Live", "Claude API", "Next.js", "Tested"],
  },
  // Facts 2.2: Cooked won first place, Track 1, among 82 submissions.
  "devhacks-cubbie": {
    name: "Cooked",
    kicker: "First place, DevHacks × Cubbie",
    // 2.2: 1st place in Track 1, among 82 submissions (not first of all 82 overall).
    num: "1st",
    numSub: "Track 1, DevHacks × Cubbie",
    description: "Scores a student’s week from Canvas deadlines and books study blocks on Google Calendar once they say yes.",
    tags: ["Hackathon winner", "Canvas", "Google Calendar"],
  },
  // Graph node and metric watchtower-agents. A personal prototype: never "production" or "shipped".
  "supply-chain-watchtower": {
    name: "Supply Chain Watchtower",
    kicker: "Personal project, built solo",
    num: "3 agents",
    numSub: "in sequence on the Claude API",
    description: "Turns sales history into a logistics plan, with risk analysis grounded in real shipping-disruption data.",
    tags: ["Multi-agent", "Claude API", "CrewAI", "RAG"],
  },
};
export const FEATURED_ORDER = ["surplus-station", "label-lens", "devhacks-cubbie", "supply-chain-watchtower"] as const;

const STATUS_KICKER: Record<Project["status"], string> = {
  production: "In production",
  live: "Live",
  hackathon: "Hackathon",
  academic: "Academic project",
  personal: "Personal project",
};
const MAX_TAGS = 3;

/** A smaller project: its own one-liner, its context (or status) as the kicker, its stack as tags, and its first figure. */
function smaller(p: Project): WorkItem {
  const first = p.impact[0];
  return {
    slug: p.slug,
    name: p.title,
    kicker: p.context ?? STATUS_KICKER[p.status],
    num: first?.value,
    numSub: first?.label,
    description: p.oneLiner,
    tags: p.stack.slice(0, MAX_TAGS),
    featured: false,
  };
}

export function workItems(): WorkItem[] {
  const bySlug = new Map(projects.map((p) => [p.slug, p]));
  const featured = FEATURED_ORDER.map((slug, i) => {
    const p = bySlug.get(slug);
    // v5 changed the graph's featured set (DECISIONS 26). This v4 catalogue keeps its own four art
    // plates until /work is rebuilt in the v5 project-pages stage, so it only checks the project exists.
    if (!p) throw new Error(`work: ${slug} is not a project in the graph`);
    return { slug, featured: true, art: i, ...FEATURED[slug] };
  });
  const rest = projects.filter((p) => !FEATURED_ORDER.includes(p.slug as (typeof FEATURED_ORDER)[number])).map(smaller);
  if (featured.length + rest.length !== projects.length) throw new Error("work: a project is missing from the catalogue");
  return [...featured, ...rest];
}
