// Pure selectors over a Graph. They import types and structure only, never
// the node data, so client code (the lenses) can run them on the fetched
// graph.json without bundling the graph itself.

import { skillGroupOrder } from "./groups.ts";
import type { Edge, Graph, GraphNode, Impact, Project, ProjectLinks, Role, SkillGroup, SkillNode } from "./types.ts";

export type NodeIndex = Map<string, GraphNode>;
export const index = (g: Graph): NodeIndex => new Map(g.nodes.map((n) => [n.id, n]));
export const out = (g: Graph, from: string, type: Edge["type"]) => g.edges.filter((e) => e.from === from && e.type === type);
export const node = <T extends GraphNode["type"]>(byId: NodeIndex, id: string, type: T): Extract<GraphNode, { type: T }> => {
  const n = byId.get(id);
  if (!n || n.type !== type) throw new Error(`graph: expected ${type} node "${id}"`);
  return n as Extract<GraphNode, { type: T }>;
};

const defaultLinkLabel = { repo: "Repository", live: "Live app", writeup: "Write-up" } as const;

/** Card links from the project's artifacts, in edge order: the first repo is "Repository", further repos go under `more`. */
function projectLinks(g: Graph, byId: NodeIndex, projectId: string): ProjectLinks {
  const artifacts = out(g, projectId, "produced")
    .map((e) => node(byId, e.to, "artifact"))
    .filter((a) => a.kind !== "diagram" && a.kind !== "resume");
  return artifacts.reduce<ProjectLinks>((links, a) => {
    if (a.kind === "repo" && links.repo) return { ...links, more: [...(links.more ?? []), { label: a.linkLabel ?? defaultLinkLabel.repo, url: a.url }] };
    return { ...links, [a.kind]: a.url, ...(a.kind === "repo" && a.linkLabel ? { repoLabel: a.linkLabel } : {}) };
  }, {});
}

/** The Project[] the Work section renders, in graph order. */
export function selectProjects(g: Graph): Project[] {
  const byId = index(g);
  return g.nodes
    .filter((n): n is Extract<GraphNode, { type: "project" }> => n.type === "project")
    .map((p) => {
      const impact: Impact[] = out(g, p.id, "achieved").map((e) => {
        const m = node(byId, e.to, "metric");
        return { value: m.value, label: m.valueLabel };
      });
      const stack = out(g, p.id, "uses")
        .filter((e) => e.chip !== false)
        .map((e) => e.label ?? node(byId, e.to, "skill").label);
      const diagrams = out(g, p.id, "produced")
        .map((e) => node(byId, e.to, "artifact"))
        .filter((a) => a.kind === "diagram")
        .map((a) => a.url);
      return {
        ...p.content,
        slug: p.id.replace(/^project-/, ""),
        impact,
        stack,
        links: projectLinks(g, byId, p.id),
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
