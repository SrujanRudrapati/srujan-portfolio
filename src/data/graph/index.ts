// Assembles the graph and selects the views the components render. The
// selectors are pure functions of the graph, so the site renders from one
// source of truth; the Phase 4 and 5 components did not change.

import { artifactNodes, projectEdges, projectMetricNodes, projectNodes } from "./projects.ts";
import { certificationNodes, educationNodes, roleEdges, roleMetricNodes, roleNodes } from "./roles.ts";
import { skillNodes } from "./skills.ts";
import { eventNodes, industryNodes, problemNodes } from "./context.ts";
import type { Edge, Graph, GraphNode, SkillNode } from "./types.ts";

export * from "./types.ts";
export * from "./selectors.ts";
export { skillGroupOrder } from "./groups.ts";

const edges: Edge[] = [...projectEdges, ...roleEdges];

const listNames = (names: string[]): string =>
  names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;

/** Skill summaries are derived: where the Skills section lists it, and which projects or roles use it. */
function skillSummary(skill: SkillNode, byId: Map<string, GraphNode>): string {
  const groups = skill.groups.map((g) => (g.sub ? `${g.group}, ${g.sub}` : g.group));
  const users = edges
    .filter((e) => e.type === "uses" && e.to === skill.id)
    .map((e) => byId.get(e.from))
    .filter((n): n is GraphNode => !!n)
    .map((n) => (n.type === "project" ? n.content.title : n.label));
  const first = groups.length > 0 ? `Listed under ${listNames(groups)} in the Skills section.` : "Part of a project stack.";
  const second = users.length > 0 ? ` Used in ${listNames(users)}.` : "";
  return first + second;
}

function assemble(): Graph {
  const raw: GraphNode[] = [
    ...projectNodes,
    ...roleNodes,
    ...educationNodes,
    ...certificationNodes,
    ...skillNodes,
    ...projectMetricNodes,
    ...roleMetricNodes,
    ...industryNodes,
    ...problemNodes,
    ...artifactNodes,
    ...eventNodes,
  ];
  const byId = new Map(raw.map((n) => [n.id, n]));
  const nodes = raw.map((n) => (n.type === "skill" && !n.summary ? { ...n, summary: skillSummary(n, byId) } : n));
  return { nodes, edges };
}

export const graph: Graph = assemble();
export const nodes = graph.nodes;
export { edges };
