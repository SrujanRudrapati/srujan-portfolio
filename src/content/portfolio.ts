// All copy and metrics come from PORTFOLIO_BRIEF.md and, from Phase 4 on,
// .claude/skills/portfolio-facts. Do not add numbers, titles, or client names
// that are not in those sources. Projects: src/data/projects.ts.

export { about, profile } from "./profile.ts";

// Projects, experience, skills, certifications and education are views of the
// knowledge graph (src/data/graph, runbook Phase 6). Edit the graph, not these.

// Relative import so Node can run scripts/content-dump.mts without the "@/" alias.
import { graph, selectCertifications, selectEducation, selectExperience, selectSkillGroups } from "../data/graph.ts";

export type { Role, SkillGroup } from "../data/graph.ts";

export const experience = selectExperience(graph);
export const skills = selectSkillGroups(graph);
export const certifications = selectCertifications(graph);
export const education = selectEducation(graph);
