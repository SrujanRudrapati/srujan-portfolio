// Projects are a view of the knowledge graph (runbook Phase 6): project nodes
// plus their metric, skill and artifact edges, selected in graph order. Edit
// src/data/graph/projects.ts, not this file. The shape the Work section
// consumes is unchanged from Phase 4.

import { graph, selectProjects } from "./graph.ts";
import type { Project } from "./graph.ts";

export type { Impact, Project, ProjectLinks, ProjectStatus, ProjectTag, StatusNote } from "./graph.ts";
export { primaryLink, statusLabel } from "./project-helpers.ts";

export const projects: Project[] = selectProjects(graph);

export const featuredProjects = projects.filter((p) => p.featured);
export const otherProjects = projects.filter((p) => !p.featured);
