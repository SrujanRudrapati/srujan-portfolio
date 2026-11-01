import { graph, type ArtifactNode, type GraphNode, type MetricNode, type ProblemNode, type Project } from "./graph.ts";
import { out } from "./graph/selectors.ts";
import { covers, screenshots } from "./covers.ts";
import { projects } from "./projects.ts";

// What one /work/[slug] case study shows (runbook V5), read from the graph: no figure or
// sentence is typed into the page. Sections without data are left out, which is what makes
// the shorter projects' pages compact.

export type Figure = { value: string; label: string; summary: string };
export type NamedLink = { label: string; url: string };
export type Problem = { label: string; summary?: string };
export type Entry = { name: string; note?: string; text: string; links: NamedLink[] };
export type NextProject = { slug: string; title: string; oneLiner: string; figure?: Figure; poster?: string };

export type CaseStudy = {
  project: Project;
  /** 1-based position in the work index, and how many projects there are. */
  position: number;
  total: number;
  figures: Figure[];
  problems: Problem[];
  links: NamedLink[];
  entries: Entry[];
  cover?: { scene: string; label: string };
  screenshot?: (typeof screenshots)[string];
  next: NextProject;
};

const byId = new Map<string, GraphNode>(graph.nodes.map((n) => [n.id, n]));

function get<T extends GraphNode["type"]>(id: string, type: T): Extract<GraphNode, { type: T }> {
  const n = byId.get(id);
  if (!n || n.type !== type) throw new Error(`case-study: missing ${type} ${id}`);
  return n as Extract<GraphNode, { type: T }>;
}

const DEFAULT_LABEL: Record<ArtifactNode["kind"], string> = { live: "Live app", repo: "Repository", writeup: "Write-up", diagram: "Diagram", resume: "Resume" };

function figures(projectId: string): Figure[] {
  return out(graph, projectId, "achieved").map((e) => {
    const m: MetricNode = get(e.to, "metric");
    return { value: m.value, label: m.valueLabel, summary: m.summary };
  });
}

function links(projectId: string): NamedLink[] {
  return out(graph, projectId, "produced")
    .map((e) => get(e.to, "artifact"))
    .filter((a) => a.kind === "live" || a.kind === "repo" || a.kind === "writeup")
    .map((a) => ({ label: a.linkLabel ?? DEFAULT_LABEL[a.kind], url: a.url }));
}

/** Problems the project solved. The node's summary only when this project is the only one that solved it;
 *  shared problems (summaries naming several projects) show their label, linked to the By problem lens. */
function problems(projectId: string): Problem[] {
  return out(graph, projectId, "solved").map((e) => {
    const p: ProblemNode = get(e.to, "problem");
    const solvers = graph.edges.filter((x) => x.type === "solved" && x.to === p.id).length;
    return solvers === 1 ? { label: p.label, summary: p.summary } : { label: p.label };
  });
}

/** The 3D cover's label, with any "{metric-id}" filled from the graph. */
export function cover(slug: string): CaseStudy["cover"] {
  const c = covers[slug];
  if (!c) return undefined;
  return { scene: c.scene, label: c.label.replace(/\{([a-z0-9-]+)\}/g, (_, id: string) => get(`metric-${id}`, "metric").value) };
}

function next(i: number): NextProject {
  const p = projects[(i + 1) % projects.length];
  const scene = covers[p.slug]?.scene;
  const lead = figures(`project-${p.slug}`)[0];
  return { slug: p.slug, title: p.title, oneLiner: p.oneLiner, ...(lead ? { figure: lead } : {}), ...(scene ? { poster: `/posters/${scene}.webp` } : {}) };
}

/** Each entry's text must be the end of one of the project's highlights ("Cooked (winner): reads ..."), so the two
 *  never drift apart; checked for every project when this module loads, which fails the build. */
for (const p of projects) {
  for (const en of p.entries ?? []) {
    const ok = p.highlights.some((h) => h.startsWith(en.name) && h.toLowerCase().endsWith(en.text.toLowerCase()));
    if (!ok) throw new Error(`case-study: ${p.slug} entry "${en.name}" does not match any highlight`);
  }
}

export function caseStudy(slug: string): CaseStudy | undefined {
  const i = projects.findIndex((p) => p.slug === slug);
  if (i < 0) return undefined;
  const project = projects[i];
  const id = `project-${slug}`;
  const all = links(id);
  const entries = (project.entries ?? []).map((en) => ({ ...en, links: all.filter((l) => l.label.startsWith(`${en.name} `)) }));
  const shot = screenshots[slug];
  return {
    project,
    position: i + 1,
    total: projects.length,
    figures: figures(id),
    problems: problems(id),
    links: all,
    entries,
    ...(shot ? { screenshot: shot } : { cover: cover(slug) }),
    next: next(i),
  };
}
