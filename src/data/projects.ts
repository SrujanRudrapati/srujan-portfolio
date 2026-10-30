// Projects are a view of the knowledge graph (runbook Phase 6): project nodes
// plus their metric, skill and artifact edges, selected in graph order. Edit
// src/data/graph/projects.ts, not this file. The shape the Work section
// consumes is unchanged from Phase 4.

import { graph, selectProjects } from "./graph.ts";
import type { Project, ProjectStatus } from "./graph.ts";

export type { Impact, Project, ProjectLinks, ProjectStatus, ProjectTag, StatusNote } from "./graph.ts";

export const projects: Project[] = selectProjects(graph);

export const featuredProjects = projects.filter((p) => p.featured);
export const otherProjects = projects.filter((p) => !p.featured);

export const statusLabel: Record<ProjectStatus, string> = {
  production: "Production",
  live: "Live",
  hackathon: "Hackathon",
  academic: "Academic",
  personal: "Personal",
};

/** Which project links the whole card should open, if any. */
export const primaryLink = (p: Project): string | undefined => p.links.live ?? p.links.repo ?? p.links.writeup;
