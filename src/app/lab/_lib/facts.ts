import { graph, type GraphNode, type MetricNode, type ProjectNode } from "@/data/graph";
import { profile } from "@/content/profile";

// Phase V1 prototypes are throwaway, but their words are not: every figure and
// sentence is read from the graph or profile here, on the server, and passed
// to the client components as plain props. Nothing is typed into a prototype.

const byId = new Map<string, GraphNode>(graph.nodes.map((n) => [n.id, n]));

function metricNode(id: string): MetricNode {
  const n = byId.get(`metric-${id}`);
  if (!n || n.type !== "metric") throw new Error(`lab facts: missing metric-${id}`);
  return n;
}

function projectNode(slug: string): ProjectNode {
  const n = byId.get(`project-${slug}`);
  if (!n || n.type !== "project") throw new Error(`lab facts: missing project-${slug}`);
  return n;
}

export type LabMetric = { value: string; label: string; summary: string };
export type LabProject = { slug: string; title: string; oneLiner: string; status: string; date?: string; highlights: string[]; metric: LabMetric };

const m = (id: string): LabMetric => {
  const n = metricNode(id);
  return { value: n.value, label: n.valueLabel, summary: n.summary };
};

const p = (slug: string, metricId: string): LabProject => {
  const { content } = projectNode(slug);
  return {
    slug,
    title: content.title,
    oneLiner: content.oneLiner,
    status: content.status,
    date: content.date,
    highlights: content.highlights,
    metric: m(metricId),
  };
};

export function labFacts() {
  return {
    name: profile.name,
    headline: profile.headline,
    subline: profile.subline,
    now: profile.now,
    email: profile.email,
    github: profile.github,
    linkedin: profile.linkedin,
    // Featured order from the facts: Surplus AI, DevHacks × Cubbie, Label Lens, Watchtower.
    featured: [
      p("surplus-ai", "surplus-processing-time"),
      p("devhacks-cubbie", "devhacks-place"),
      p("label-lens", "label-lens-quotes"),
      p("supply-chain-watchtower", "watchtower-agents"),
    ],
    proof: [m("surplus-processing-time"), m("surplus-pallet-time"), m("records-per-day"), m("devhacks-submissions"), m("label-lens-latency")],
    surplus: { project: p("surplus-ai", "surplus-processing-time"), pallet: m("surplus-pallet-time"), model: m("surplus-model-size") },
    labelLens: { project: p("label-lens", "label-lens-quotes"), latency: m("label-lens-latency"), tests: m("label-lens-tests") },
    devhacks: { project: p("devhacks-cubbie", "devhacks-place"), submissions: m("devhacks-submissions"), receipts: m("receipts-tests") },
    records: m("records-per-day"),
  };
}

export type LabFacts = ReturnType<typeof labFacts>;
