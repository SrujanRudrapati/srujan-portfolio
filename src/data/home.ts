import { graph, type GraphNode, type MetricNode } from "./graph.ts";
import { profile } from "../content/profile.ts";

// Everything the v4 home (the hub) says, read from the graph and profile so no figure is typed
// into a component. A missing node fails the build. Copy is the approved reference's
// (docs/v4/reference/srujan-premium-concept.html), checked against portfolio-facts.

const byId = new Map<string, GraphNode>(graph.nodes.map((n) => [n.id, n]));

function metric(id: string): MetricNode {
  const n = byId.get(`metric-${id}`);
  if (!n || n.type !== "metric") throw new Error(`home: missing metric-${id}`);
  return n;
}

const CELEBAL = "Celebal Technologies";

function hasRoleAt(org: RegExp): boolean {
  return graph.nodes.some((n) => n.type === "role" && org.test(n.content.org));
}

export type TileKey = "work" | "experience" | "about" | "contact";
export type HubTile = { key: TileKey; href: string; name: string; hint: string; description: string };

function tiles(): HubTile[] {
  const projects = graph.nodes.filter((n) => n.type === "project");
  const featured = projects.filter((n) => n.type === "project" && n.content.featured).length;
  if (!hasRoleAt(/Celebal/) || !hasRoleAt(/Arizona State/)) throw new Error("home: Experience hint names a role that is not in the graph");
  return [
    // Counts from the graph: 4 featured and 7 more (W0 ruling: eleven projects, not the reference's ten).
    { key: "work", href: "/work", name: "Work", hint: `${featured} featured, ${projects.length - featured} more`, description: "A catalogue of what I’ve built and what it changed" },
    // Celebal from Jul 2022 (facts 2.4) to ASU Surplus now (2.1).
    { key: "experience", href: "/experience", name: "Experience", hint: "Celebal, ASU Surplus", description: "2022 to now, on one timeline" },
    { key: "about", href: "/about", name: "About", hint: "M.S., Arizona State", description: "Education, certifications and how I work" },
    // profile.status: available early 2027.
    { key: "contact", href: "/contact", name: "Contact", hint: "Open to roles in 2027", description: "Write a note, it opens in your email" },
  ];
}

export function homeContent() {
  const records = metric("records-per-day"); // "about 10 million" "records a day" (facts 2.4)
  if (!hasRoleAt(new RegExp(CELEBAL)) || !records.tags.includes("celebal")) throw new Error("home: the lede's pipeline is not a Celebal role in the graph");
  return {
    // Three lines, each its own mask (motion-system: hero headline). Same sentence as profile.headline.
    headline: ["I build the", "data layer, and the", "AI on top of it."],
    headlineText: profile.headline,
    lede: {
      lead: "Data and AI engineer, finishing an M.S. at Arizona State University.",
      // Facts 2.4 (Celebal Technologies; on call for the pipeline, about 10 million records a day) and 2.1
      // (Surplus AI, one offline LLM system, in production). Naming the employer: DECISIONS 24a.
      rest: `At ${CELEBAL} I was on call for a pipeline moving ${records.value} ${records.valueLabel}; now I run an offline LLM system in production.`,
    },
    now: "Now running Surplus AI in production at ASU Surplus",
    tiles: tiles(),
  };
}

export type HomeContent = ReturnType<typeof homeContent>;
