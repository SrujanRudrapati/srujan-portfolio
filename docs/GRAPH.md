# The knowledge graph

One typed graph is the source of truth for everything the site says about Srujan (runbook Phase 6). Projects, experience, skills, certifications and education are views selected from it; the lenses (Phase 7) and the Ask panel (Phase 8) read the same graph from `public/graph.json` and `public/search-index.json`.

## Where things live

| Path | What |
|---|---|
| `src/data/graph/types.ts` | Node and edge types, plus the view shapes the components consume (`Project`, `Role`, `SkillGroup`) |
| `src/data/graph/projects.ts` | Project nodes (with the card content), their metric and artifact nodes, and their edges |
| `src/data/graph/roles.ts` | Role, education and certification nodes, role metrics, role edges |
| `src/data/graph/skills.ts` | Skill nodes in Skills-section order, plus stack-only tools |
| `src/data/graph/context.ts` | Industry, problem and event nodes |
| `src/data/graph/index.ts` | Assembles `graph`, fills derived skill summaries, exports the selectors |
| `src/data/graph.ts` | Entry point: `graph`, `nodes`, `edges`, types, selectors |
| `src/data/projects.ts` | `projects = selectProjects(graph)` and the helpers the Work section uses |
| `src/content/portfolio.ts` | `profile`, `about`, and `experience`, `skills`, `certifications`, `education` selected from the graph |
| `scripts/build-graph.mts` | Validates the graph and writes `public/graph.json` and `public/search-index.json`; runs as `prebuild` |

## Counts (2026-10-30)

157 nodes: project 11, role 4, education 2, certification 4, skill 82, metric 18, industry 12, problem 12, artifact 9, event 3. 144 edges. `npm run graph` prints the current numbers.

## Node and edge types

Node types: `project`, `role`, `education`, `certification`, `skill`, `metric`, `industry`, `problem`, `artifact`, `event`. Every node has `id` (stable slug, prefixed by its type), `type`, `label`, `summary` (at most two sentences), optional `dates {start, end}`, `evidence [{label, url}]` (a repo, a live app, or a fragment link to the site section), and `tags`.

Edge types and the endpoints the validator allows:

| Type | From | To | Meaning |
|---|---|---|---|
| `uses` | project, role | skill | the stack; `label` on the edge overrides the chip text (e.g. "Kubernetes (kind)") |
| `achieved` | project, role | metric | impact figures, in edge order |
| `solved` | project, role | problem | what was solved |
| `in` | project, role | industry | where it applies |
| `at` | project | role, education | the org or programme it was done for |
| `produced` | project, role | artifact | repo, live app, write-up, diagram, resume; in edge order |
| `during` | project, event | role, education | the period it happened in |

`uses`, `solved` and `in` also accept a role as the source so the Celebal bullets count in the Skill map and the By problem lens; the runbook lists only projects.

## What the build checks

`npm run build` runs `prebuild`, which fails the build if: an edge endpoint does not exist; an edge joins node types the table above does not allow; a node id is duplicated; a node has no label, no summary, or a summary longer than two sentences; a metric's `value` is neither numeric nor quoted, or has no evidence link; a project has no evidence link; an evidence URL is not a fragment, a root path or http(s); a label or summary contains an em or en dash; or a project, metric, industry or problem node has no edges.

The emitted files are committed: the GitHub Pages workflow runs `next build` directly, so it ships whatever the last local `npm run build` generated. Run `npm run graph` (or `npm run build`) after editing the graph and commit `public/graph.json` and `public/search-index.json` with it.

## How to add a project in three steps

1. **Add the project node** to `projectNodes` in `src/data/graph/projects.ts`: `id: "project-<slug>"`, `label`, a two-sentence `summary`, `dates`, `evidence` (at least the card anchor `#project-<slug>`), `tags`, and `content` (the card text: `title`, `oneLiner`, `status`, `featured`, `highlights`, and optionally `date`, `context`, `credit`, `tags`, `problem`, `built`, `details`, `statusNotes`). Put featured projects in the facts' featured order; the array order is the render order.
2. **Add its figures, links and diagrams as nodes**: a `metric` node per impact figure (`value` keeps its marker, `valueLabel` is the small text, at least one evidence link) in `projectMetricNodes`; an `artifact` node per repo, live app or diagram in `artifactNodes` (diagram `url` is the key registered in `src/components/diagrams/projectDiagrams.tsx`). New tools go in `src/data/graph/skills.ts` as `tool(...)` entries, or into a Skills-section group.
3. **Connect it** in `projectEdges`: `achieved` to each metric (max three), `uses` to each skill in chip order, `produced` to each artifact (first repo becomes "Repository", further repos go under "more"; first diagram is inline, the rest sit in "How it works"), and `solved`, `in`, `at`, `during` as they apply. Then `npm run build`: the validator reports anything missing, and the Work section, lenses and Ask index pick the project up with no component changes.

Every string must trace to `.claude/skills/portfolio-facts/SKILL.md` or to text already on the site (runbook rule 5).
