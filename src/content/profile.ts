// Identity, hero and contact strings. Kept free of graph imports so client
// components (the sticky nav, the Ask panel) can import `profile` without
// pulling the whole knowledge graph into the browser bundle. Facts: see
// .claude/skills/portfolio-facts.

export const profile = {
  name: "Srujan Rudrapati",
  headline: "I build the data layer, and the AI on top of it.",
  subline:
    "Data engineer working across Databricks, Azure, and AWS. Lately building LLM systems that run on real data.",
  location: "Phoenix, AZ",
  status: "Graduating December 2026, available January 2027",
  // Header line (runbook v4 W1.2); the same fact as `status`.
  availability: "Available January 2027",
  // DECISIONS 26 E: the full availability line, used on the home page and Contact.
  availabilityLine: "Available January 2027. Open to relocating anywhere in the US, or remote.",
  // Hero status line. Same facts as the About paragraph and `status`, so a
  // recruiter sees "where he is now and when he is free" on the first screen.
  now: "M.S. student at Arizona State University. Graduating December 2026, available January 2027.",
  email: "rudrapati.srujan@gmail.com",
  linkedin: "https://www.linkedin.com/in/srujan-rudrapati",
  linkedinLabel: "linkedin.com/in/srujan-rudrapati",
  github: "https://github.com/SrujanRudrapati",
  githubLabel: "github.com/SrujanRudrapati",
  resume: "/resume.pdf",
  // Hero proof chips. Each one restates a fact that already appears on the
  // site: the Surplus Station status line, the Celebal role in Experience (facts 2.4: Associate,
  // Sep 2022 to Nov 2024; wording from DECISIONS 14), and Certifications.
  proof: [
    "Surplus Station, in production at ASU Surplus",
    "Associate at Celebal Technologies (2022 to 2024)",
    "Databricks Certified Data Engineer Professional",
  ],
};

// Written for the site from the facts in .claude/skills/portfolio-facts.
export const about = [
  "I’m a data engineer finishing an M.S. in Data Science, Analytics, and Engineering at Arizona State University.",
  "Before that I spent two years at Celebal Technologies building data platforms on Azure Databricks for clients in healthcare, energy, manufacturing, and e-commerce.",
  "Lately I build LLM systems that run on real data, like a private, offline AI system for ASU Surplus.",
];
