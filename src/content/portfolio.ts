// All copy and metrics come from PORTFOLIO_BRIEF.md and, from Phase 4 on,
// .claude/skills/portfolio-facts. Do not add numbers, titles, or client names
// that are not in those sources. Projects: src/data/projects.ts.

export const profile = {
  name: "Srujan Rudrapati",
  headline: "I build the data layer, and the AI on top of it.",
  subline:
    "Data engineer working across Databricks, Azure, and AWS. Lately building LLM systems that run on real data.",
  location: "Phoenix, Arizona",
  status: "Graduating December 2026, available early 2027",
  // Hero status line. Same facts as the About paragraph and `status`, so a
  // recruiter sees "where he is now and when he is free" on the first screen.
  now: "M.S. student at Arizona State University. Graduating December 2026, available early 2027.",
  email: "rudrapati.srujan@gmail.com",
  linkedin: "https://www.linkedin.com/in/srujan-rudrapati",
  linkedinLabel: "linkedin.com/in/srujan-rudrapati",
  github: "https://github.com/SrujanRudrapati",
  githubLabel: "github.com/SrujanRudrapati",
  resume: "/resume.pdf",
  // Hero proof chips. Each one restates a fact that already appears on the
  // site: the Surplus AI status line, the About paragraph, and Certifications.
  proof: [
    "Surplus AI, in production at ASU Surplus",
    "Two years of data engineering at Celebal",
    "Databricks Certified Data Engineer Professional",
  ],
};

// Written for the site from facts in the brief (the brief asks for 3-4 sentences but gives no draft).
export const about = [
  "I'm a data engineer finishing an M.S. in Data Science, Analytics, and Engineering at Arizona State University.",
  "Before that I spent two years at Celebal Technologies building data platforms on Azure Databricks for clients in healthcare, energy, manufacturing, and e-commerce.",
  "Lately I build LLM systems that run on real data, like a private, offline AI system for ASU Surplus.",
  "I graduate in December 2026 and I'm available early 2027.",
];

// Projects, experience, skills, certifications and education are views of the
// knowledge graph (src/data/graph, runbook Phase 6). Edit the graph, not these.

// Relative import so Node can run scripts/content-dump.mts without the "@/" alias.
import { graph, selectCertifications, selectEducation, selectExperience, selectSkillGroups } from "../data/graph.ts";

export type { Role, SkillGroup } from "../data/graph.ts";

export const experience = selectExperience(graph);
export const skills = selectSkillGroups(graph);
export const certifications = selectCertifications(graph);
export const education = selectEducation(graph);
