import { graph, type GraphNode, type MetricNode, type ProjectNode } from "./graph.ts";
import { profile } from "../content/profile.ts";
import { covers } from "./covers.ts";

// Everything the v3 home page says (runbook V4), read from the graph and profile so no
// figure or sentence is typed into a component. A missing node fails the build.

const byId = new Map<string, GraphNode>(graph.nodes.map((n) => [n.id, n]));

function metric(id: string) {
  const n = byId.get(`metric-${id}`);
  if (!n || n.type !== "metric") throw new Error(`home: missing metric-${id}`);
  const m = n as MetricNode;
  return { value: m.value, label: m.valueLabel, summary: m.summary };
}

function project(slug: string, metricId: string, useSummary = false) {
  const n = byId.get(`project-${slug}`);
  if (!n || n.type !== "project") throw new Error(`home: missing project-${slug}`);
  const { content } = n as ProjectNode;
  const m = metric(metricId);
  const cover = coverFor(slug);
  // useSummary: the metric's own sentence says more precisely what the figure is about.
  return { slug, title: content.title, oneLiner: content.oneLiner, status: content.status, metric: useSummary ? { ...m, label: m.summary } : m, cover };
}

/** A featured project's cover, with any "{metric-id}" in its label filled from the graph. */
export function coverFor(slug: string) {
  const c = covers[slug];
  if (!c) throw new Error(`home: no cover for ${slug}`);
  return { scene: c.scene, label: c.label.replace(/\{([a-z0-9-]+)\}/g, (_, id: string) => metric(id).value) };
}

export function homeContent() {
  return {
    profile: {
      name: profile.name,
      headline: profile.headline,
      subline: profile.subline,
      now: profile.now,
      proof: profile.proof,
      email: profile.email,
      github: profile.github,
      linkedin: profile.linkedin,
      resume: profile.resume,
    },
    // Screen 2: what he does, each line tied to a fact already on the site (portfolio-facts 2.1, 2.3, 2.4).
    statements: [
      { text: `Pipelines on Databricks, Azure and AWS, one of them handling ${metric("records-per-day").value} ${metric("records-per-day").label}.`, href: "/about#experience", proofFor: "experience at Celebal" },
      { text: "Private, offline AI in production at ASU Surplus, on a cluster of Mac minis.", href: "/work/surplus-ai", proofFor: "Surplus AI" },
      { text: "LLM tools that show their evidence: every Label Lens warning quotes the label word for word.", href: "/work/label-lens", proofFor: "Label Lens" },
    ],
    // Featured order (facts): Surplus AI, DevHacks × Cubbie, Label Lens, Supply Chain Watchtower.
    featured: [
      project("surplus-ai", "surplus-processing-time"),
      // Cooked won (facts 2.2), not all three entries: the card shows the metric's sentence that says so.
      project("devhacks-cubbie", "devhacks-place", true),
      project("label-lens", "label-lens-quotes"),
      project("supply-chain-watchtower", "watchtower-agents"),
    ],
    projectCount: graph.nodes.filter((n) => n.type === "project").length,
    // The strongest single result, shown in the hero (recruiter review, V4).
    lead: { ...metric("surplus-processing-time"), where: "Surplus AI at ASU Surplus" },
    // Each figure carries the project or employer it came from (names already on the site).
    proof: [
      { ...metric("surplus-processing-time"), source: "Surplus AI" },
      { ...metric("surplus-pallet-time"), source: "Surplus AI" },
      { ...metric("records-per-day"), source: "Celebal" },
      { ...metric("devhacks-submissions"), source: "DevHacks × Cubbie" },
      { ...metric("label-lens-latency"), source: "Label Lens" },
    ],
  };
}

export type HomeContent = ReturnType<typeof homeContent>;
