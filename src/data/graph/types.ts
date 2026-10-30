// The knowledge graph (runbook Phase 6). One typed graph is the source of
// truth; projects.ts, experience, skills, certifications and education are
// views selected from it (see ./index.ts). Nothing here imports from
// components or from src/content, so Node can load it for scripts/build-graph.mts.

export type NodeType =
  | "project"
  | "role"
  | "education"
  | "certification"
  | "skill"
  | "metric"
  | "industry"
  | "problem"
  | "artifact"
  | "event";

export type EdgeType = "uses" | "achieved" | "solved" | "in" | "at" | "produced" | "during";

/** `url` is a fragment ("#work"), an http(s) URL, or a root path ("/resume.pdf"). Root paths are
 *  stored without the GitHub Pages prefix: anything that renders one from graph.json must pass it
 *  through `withBasePath` (src/lib/paths.ts). Same for `ArtifactNode.url`. */
export type Evidence = { label: string; url: string };

/** ISO-like dates: "2026-06" or "2022". `end` omitted means ongoing; `start` omitted means only the end is on record (e.g. an expected graduation). */
export type Dates = { start?: string; end?: string };

type Base<T extends NodeType> = {
  id: string;
  type: T;
  label: string;
  /** At most two sentences. */
  summary: string;
  dates?: Dates;
  /** Links to a repo, a live app, or the site section itself (a fragment URL). */
  evidence: Evidence[];
  tags: string[];
};

/* Project content as the cards render it. Impact figures, stack chips, links
   and diagrams are NOT stored here: they come from metric, skill and artifact
   nodes through edges. */
export type ProjectStatus = "production" | "live" | "hackathon" | "academic" | "personal";
export type ProjectTag = "ai" | "data";
export type StatusNote = { state: "running" | "pending" | "neutral"; text: string };

export type ProjectContent = {
  title: string;
  oneLiner: string;
  status: ProjectStatus;
  featured: boolean;
  highlights: string[];
  date?: string;
  context?: string;
  credit?: string;
  tags: ProjectTag[];
  problem?: string;
  built?: string;
  details?: { heading: string; items: { name: string; text: string }[] };
  statusNotes?: StatusNote[];
  statusDetail?: string;
};

export type ProjectNode = Base<"project"> & { content: ProjectContent };

/* A job or internship, as the Experience section renders it. */
export type RoleContent = {
  title: string;
  org: string;
  place: string;
  dates: string;
  summary?: string;
  outcomes: { label?: string; text: string }[];
};
export type RoleNode = Base<"role"> & { content: RoleContent };

export type EducationNode = Base<"education"> & { content: { degree: string; school: string; dates: string; gpa: string } };
export type CertificationNode = Base<"certification">;

/** A skill chip. `groups` places it in the Skills section (a skill can sit in two groups); stack-only tools have none.
 *  `position` pins the chip's index inside that group when declaration order would put it elsewhere. */
export type SkillNode = Base<"skill"> & { groups: { group: string; sub?: string; position?: number }[] };

/** A figure. `value` keeps its marker ("~80%", "about 50%"). */
export type MetricNode = Base<"metric"> & { value: string; valueLabel: string };

export type IndustryNode = Base<"industry">;
export type ProblemNode = Base<"problem">;
export type EventNode = Base<"event">;

export type ArtifactKind = "repo" | "live" | "writeup" | "diagram" | "resume";
export type ArtifactNode = Base<"artifact"> & {
  kind: ArtifactKind;
  /** External URL for repo, live and writeup; a diagram registry key for diagrams. */
  url: string;
  /** Link text on a card when the default ("Repository", "Live app") is ambiguous. */
  linkLabel?: string;
};

export type GraphNode =
  | ProjectNode
  | RoleNode
  | EducationNode
  | CertificationNode
  | SkillNode
  | MetricNode
  | IndustryNode
  | ProblemNode
  | ArtifactNode
  | EventNode;

export type Edge = {
  from: string;
  to: string;
  type: EdgeType;
  /** Chip text when a project calls a skill by another name, e.g. "Kubernetes (kind)". */
  label?: string;
  /** `false` keeps a `uses` edge in the graph (Skill map, Ask) without adding a stack chip to the card. */
  chip?: false;
};

export type Graph = { nodes: GraphNode[]; edges: Edge[] };

/* The shapes the Phase 4 and Phase 5 components consume, unchanged. */
export type Impact = { value: string; label: string };
export type ProjectLinks = {
  live?: string;
  repo?: string;
  repoLabel?: string;
  writeup?: string;
  more?: { label: string; url: string }[];
};
export type Project = ProjectContent & {
  slug: string;
  impact: Impact[];
  stack: string[];
  links: ProjectLinks;
  diagram?: string;
  secondaryDiagrams?: string[];
};
export type Role = RoleContent;
export type SkillGroup = { name: string; items?: string[]; subgroups?: { name: string; items: string[] }[] };
