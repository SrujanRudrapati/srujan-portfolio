// View models for the lenses (runbook Phase 7). Pure functions of a Graph, so
// the client runs them on the fetched graph.json. Text comes straight from
// node content and summaries; nothing here writes new copy.

import { skillGroupOrder } from "./groups.ts";
import { index, node, selectProjects, type NodeIndex } from "./selectors.ts";
import type { Graph, GraphNode, MetricNode, Project, RoleContent, SkillNode } from "./types.ts";

/** A project or role as a one-line entry in a lens list. */
export type LensItem = {
  id: string;
  kind: "project" | "role";
  title: string;
  /** Org for roles, one-liner for projects. */
  line: string;
  /** In-page link: the project card, or the Timeline for roles. */
  href: string;
  /** Lead figure, written as value plus label. */
  metric?: string;
};

const projectHref = (slug: string) => `#project-${slug}`;
const ROLE_HREF = "#lens=timeline";

const metricText = (m: MetricNode) => `${m.value} ${m.valueLabel}`;

function leadMetric(g: Graph, byId: NodeIndex, id: string): string | undefined {
  const edge = g.edges.find((e) => e.from === id && e.type === "achieved");
  return edge ? metricText(node(byId, edge.to, "metric")) : undefined;
}

function lensItem(g: Graph, byId: NodeIndex, n: GraphNode): LensItem | null {
  if (n.type === "project") {
    const slug = n.id.replace(/^project-/, "");
    return { id: n.id, kind: "project", title: n.content.title, line: n.content.oneLiner, href: projectHref(slug), metric: leadMetric(g, byId, n.id) };
  }
  if (n.type === "role") return { id: n.id, kind: "role", title: n.content.title, line: n.content.org, href: ROLE_HREF };
  return null;
}

/** Projects first (graph order), then roles, that link to `targetId` with `type`. */
function itemsLinkedTo(g: Graph, byId: NodeIndex, targetId: string, type: "uses" | "solved" | "in"): LensItem[] {
  const sources = g.edges.filter((e) => e.to === targetId && e.type === type).map((e) => e.from);
  const unique = [...new Set(sources)].map((id) => byId.get(id)).filter((n): n is GraphNode => !!n);
  const items = unique.map((n) => lensItem(g, byId, n)).filter((i): i is LensItem => !!i);
  const order = new Map(g.nodes.map((n, i) => [n.id, i]));
  const rank = (i: LensItem) => (i.kind === "project" ? 0 : 1) * 10_000 + (order.get(i.id) ?? 0);
  return [...items].sort((a, b) => rank(a) - rank(b));
}

/* ---------- Timeline ---------- */

export type TimelineProject = Project & { dateTime?: string };
export type TimelineEntry = {
  id: string;
  kind: "role" | "education" | "undated";
  title: string;
  org: string;
  place?: string;
  datesText?: string;
  dateTime?: string;
  current: boolean;
  summary?: string;
  outcomes: RoleContent["outcomes"];
  detail?: string;
  projects: TimelineProject[];
};

const ONGOING = "9999";
const sortEnd = (n: GraphNode) => (n.dates ? (n.dates.end ?? ONGOING) : "0000");
const sortStart = (n: GraphNode) => n.dates?.start ?? n.dates?.end ?? "0000";

/** Roles and degrees on one axis, newest first; projects nest under the role or degree they happened during. */
export function selectTimeline(g: Graph): TimelineEntry[] {
  const byId = index(g);
  const projects = selectProjects(g);
  const projectBySlug = new Map(projects.map((p) => [p.slug, p]));
  const toTimelineProject = (n: GraphNode): TimelineProject | null => {
    const p = projectBySlug.get(n.id.replace(/^project-/, ""));
    return p ? { ...p, dateTime: n.dates?.start } : null;
  };
  const childrenOf = (id: string) =>
    g.edges
      .filter((e) => e.type === "during" && e.to === id && e.from.startsWith("project-"))
      .map((e) => byId.get(e.from))
      .filter((n): n is GraphNode => !!n)
      .sort((a, b) => sortStart(b).localeCompare(sortStart(a)))
      .map(toTimelineProject)
      .filter((p): p is TimelineProject => !!p);

  const axis = g.nodes
    .filter((n) => n.type === "role" || n.type === "education")
    .sort((a, b) => sortEnd(b).localeCompare(sortEnd(a)) || sortStart(b).localeCompare(sortStart(a)));

  const entries: TimelineEntry[] = axis.map((n) => {
    if (n.type === "role") {
      const c = n.content;
      return { id: n.id, kind: "role", title: c.title, org: c.org, place: c.place, datesText: c.dates, dateTime: n.dates?.start ?? n.dates?.end, current: !n.dates?.end, summary: c.summary, outcomes: c.outcomes, projects: childrenOf(n.id) };
    }
    const e = node(byId, n.id, "education");
    return { id: e.id, kind: "education", title: e.content.degree, org: e.content.school, datesText: e.content.dates, dateTime: e.dates?.end ?? e.dates?.start, current: false, detail: e.content.gpa, outcomes: [], projects: childrenOf(e.id) };
  });

  const placed = new Set(g.edges.filter((e) => e.type === "during").map((e) => e.from));
  const undated = g.nodes.filter((n) => n.type === "project" && !placed.has(n.id)).map(toTimelineProject).filter((p): p is TimelineProject => !!p);
  return undated.length > 0
    ? [...entries, { id: "undated", kind: "undated", title: "Not tied to a role or degree", org: "", current: false, outcomes: [], projects: undated }]
    : entries;
}

/* ---------- Skill map ---------- */

export type SkillChip = { id: string; label: string; count: number };
export type SkillMapGroup = { name: string; skills: SkillChip[]; subgroups?: { name: string; skills: SkillChip[] }[] };

export const STACK_GROUP = "Also in project stacks";

/** Skills grouped as in the Skills section, each with the number of projects and roles that use it; stack-only tools that are in use come last. */
export function selectSkillMap(g: Graph): SkillMapGroup[] {
  const skills = g.nodes.filter((n): n is SkillNode => n.type === "skill");
  const counts = new Map<string, number>();
  for (const e of g.edges) if (e.type === "uses") counts.set(e.to, (counts.get(e.to) ?? 0) + 1);
  const chip = (s: SkillNode): SkillChip => ({ id: s.id, label: s.label, count: counts.get(s.id) ?? 0 });
  const inGroup = (name: string, sub?: string) =>
    skills
      .flatMap((s) => {
        const entry = s.groups.find((x) => x.group === name && x.sub === sub);
        return entry ? [{ s, position: entry.position }] : [];
      })
      .reduce<SkillNode[]>((list, { s, position }) => (position === undefined ? [...list, s] : [...list.slice(0, position), s, ...list.slice(position)]), [])
      .map(chip);
  const groups: SkillMapGroup[] = skillGroupOrder.map(({ name, subs }) =>
    subs ? { name, skills: [], subgroups: subs.map((sub) => ({ name: sub, skills: inGroup(name, sub) })) } : { name, skills: inGroup(name) },
  );
  const stackOnly = skills.filter((s) => s.groups.length === 0 && (counts.get(s.id) ?? 0) > 0).map(chip);
  return stackOnly.length > 0 ? [...groups, { name: STACK_GROUP, skills: stackOnly }] : groups;
}

export const selectSkillUsers = (g: Graph, skillId: string): LensItem[] => itemsLinkedTo(g, index(g), skillId, "uses");

export const selectAllProjectItems = (g: Graph): LensItem[] => {
  const byId = index(g);
  return g.nodes.map((n) => (n.type === "project" ? lensItem(g, byId, n) : null)).filter((i): i is LensItem => !!i);
};

/* ---------- By problem, by industry ---------- */

export type KeyedCard = { id: string; label: string; summary: string; items: LensItem[] };

function keyedCards(g: Graph, type: "problem" | "industry", edge: "solved" | "in"): KeyedCard[] {
  const byId = index(g);
  return g.nodes
    .filter((n) => n.type === type)
    .map((n) => ({ id: n.id, label: n.label, summary: n.summary, items: itemsLinkedTo(g, byId, n.id, edge) }))
    .filter((c) => c.items.length > 0);
}

export const selectByProblem = (g: Graph): KeyedCard[] => keyedCards(g, "problem", "solved");
export const selectByIndustry = (g: Graph): KeyedCard[] => keyedCards(g, "industry", "in");

/* ---------- Recruiter mode ---------- */

export type RecruiterSheet = {
  metrics: { value: string; label: string; source: string }[];
  currentRole?: { title: string; org: string; dates: string };
  topSkills: string[];
  featured: { title: string; line: string; href: string }[];
};

const TOP_SKILLS = 8;

/** Metrics tagged "headline", the current role, the most-used skills, and the featured projects as single lines. */
export function selectRecruiter(g: Graph): RecruiterSheet {
  const byId = index(g);
  const sourceOf = (metricId: string) => {
    const edge = g.edges.find((e) => e.type === "achieved" && e.to === metricId);
    const owner = edge ? byId.get(edge.from) : undefined;
    if (!owner) return "";
    return owner.type === "project" ? owner.content.title : owner.type === "role" ? owner.content.org : owner.label;
  };
  const metrics = g.nodes
    .filter((n): n is MetricNode => n.type === "metric" && n.tags.includes("headline"))
    .map((m) => ({ value: m.value, label: m.valueLabel, source: sourceOf(m.id) }));
  const current = g.nodes.find((n) => n.type === "role" && n.dates && !n.dates.end);
  const counts = new Map<string, number>();
  for (const e of g.edges) if (e.type === "uses") counts.set(e.to, (counts.get(e.to) ?? 0) + 1);
  const order = new Map(g.nodes.map((n, i) => [n.id, i]));
  const topSkills = g.nodes
    .filter((n): n is SkillNode => n.type === "skill" && (counts.get(n.id) ?? 0) > 0)
    .sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0) || (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
    .slice(0, TOP_SKILLS)
    .map((s) => s.label);
  const featured = selectProjects(g)
    .filter((p) => p.featured)
    .map((p) => ({ title: p.title, line: p.oneLiner, href: projectHref(p.slug) }));
  return {
    metrics,
    ...(current && current.type === "role" ? { currentRole: { title: current.content.title, org: current.content.org, dates: current.content.dates } } : {}),
    topSkills,
    featured,
  };
}
