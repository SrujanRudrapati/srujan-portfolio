// Assembles the graph and selects the views the components render. The
// selectors are pure functions of the graph, so the site renders from one
// source of truth; the Phase 4 and 5 components did not change.

import { artifactNodes, projectEdges, projectMetricNodes, projectNodes } from "./projects.ts";
import { certificationNodes, educationNodes, roleEdges, roleMetricNodes, roleNodes } from "./roles.ts";
import { skillGroupOrder, skillNodes } from "./skills.ts";
import { eventNodes, industryNodes, problemNodes } from "./context.ts";
import type { Edge, Graph, GraphNode, Impact, Project, ProjectLinks, Role, SkillGroup, SkillNode } from "./types.ts";

export * from "./types.ts";

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

const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]));
const out = (g: Graph, from: string, type: Edge["type"]) => g.edges.filter((e) => e.from === from && e.type === type);
const node = <T extends GraphNode["type"]>(g: Graph, id: string, type: T): Extract<GraphNode, { type: T }> => {
  const n = (g === graph ? nodeMap : new Map(g.nodes.map((x) => [x.id, x]))).get(id);
  if (!n || n.type !== type) throw new Error(`graph: expected ${type} node "${id}"`);
  return n as Extract<GraphNode, { type: T }>;
};

const defaultLinkLabel = { repo: "Repository", live: "Live app", writeup: "Write-up" } as const;

function projectLinks(g: Graph, projectId: string): ProjectLinks {
  const links: ProjectLinks = {};
  for (const edge of out(g, projectId, "produced")) {
    const a = node(g, edge.to, "artifact");
    if (a.kind === "diagram" || a.kind === "resume") continue;
    if (a.kind === "repo" && links.repo) {
      links.more = [...(links.more ?? []), { label: a.linkLabel ?? defaultLinkLabel.repo, url: a.url }];
      continue;
    }
    links[a.kind] = a.url;
    if (a.kind === "repo" && a.linkLabel) links.repoLabel = a.linkLabel;
  }
  return links;
}

/** The Project[] the Work section renders, in graph order. */
export function selectProjects(g: Graph): Project[] {
  return g.nodes
    .filter((n): n is Extract<GraphNode, { type: "project" }> => n.type === "project")
    .map((p) => {
      const impact: Impact[] = out(g, p.id, "achieved").map((e) => {
        const m = node(g, e.to, "metric");
        return { value: m.value, label: m.valueLabel };
      });
      const stack = out(g, p.id, "uses")
        .filter((e) => e.chip !== false)
        .map((e) => e.label ?? node(g, e.to, "skill").label);
      const diagrams = out(g, p.id, "produced")
        .map((e) => node(g, e.to, "artifact"))
        .filter((a) => a.kind === "diagram")
        .map((a) => a.url);
      return {
        ...p.content,
        slug: p.id.replace(/^project-/, ""),
        impact,
        stack,
        links: projectLinks(g, p.id),
        ...(diagrams[0] ? { diagram: diagrams[0] } : {}),
        ...(diagrams.length > 1 ? { secondaryDiagrams: diagrams.slice(1) } : {}),
      };
    });
}

export const selectExperience = (g: Graph): Role[] =>
  g.nodes.filter((n): n is Extract<GraphNode, { type: "role" }> => n.type === "role").map((r) => r.content);

export const selectCertifications = (g: Graph): string[] =>
  g.nodes.filter((n) => n.type === "certification").map((n) => n.label);

export const selectEducation = (g: Graph) =>
  g.nodes.filter((n): n is Extract<GraphNode, { type: "education" }> => n.type === "education").map((n) => n.content);

/** Chips for one group: declaration order, with pinned positions spliced in. */
function groupItems(skills: SkillNode[], name: string, sub?: string): string[] {
  const members = skills.flatMap((s) => {
    const entry = s.groups.find((x) => x.group === name && x.sub === sub);
    return entry ? [{ label: s.label, position: entry.position }] : [];
  });
  const items = members.filter((m) => m.position === undefined).map((m) => m.label);
  for (const m of members.filter((m) => m.position !== undefined).sort((a, b) => a.position! - b.position!)) items.splice(m.position!, 0, m.label);
  return items;
}

/** Skills section groups in render order; a skill may appear in two groups. */
export function selectSkillGroups(g: Graph): SkillGroup[] {
  const skills = g.nodes.filter((n): n is SkillNode => n.type === "skill");
  return skillGroupOrder.map(({ name, subs }) =>
    subs ? { name, subgroups: subs.map((sub) => ({ name: sub, items: groupItems(skills, name, sub) })) } : { name, items: groupItems(skills, name) },
  );
}
