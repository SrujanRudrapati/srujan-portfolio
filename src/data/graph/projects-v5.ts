import type { ArtifactNode, Edge, MetricNode, ProjectNode } from "./types.ts";
import { metric } from "./factories.ts";

// Projects added for v5 (DECISIONS 26; facts Section 3). Same shapes as ./projects.ts.
// Wording is the prototype's (design/redesign.html) or the résumé's, confirmed by Srujan.
// InvoiceGuard and RecordSync repository URLs were not supplied, so no repo artifact exists
// for them yet; the pages show a visible placeholder instead.

const anchor = (slug: string) => `/work/${slug}`;
const site = (slug: string, label: string) => ({ label: `${label} page`, url: anchor(slug) });

const INVOICEGUARD_LIVE = "https://invoiceguard-srujan.onrender.com";

export const v5ProjectNodes: ProjectNode[] = [
  {
    id: "project-invoiceguard",
    type: "project",
    label: "InvoiceGuard",
    summary:
      "AI extracts invoice fields, proves every value against the original page, checks the math, and sends only doubtful invoices to a person, whose corrections become test cases. 6 of 6 bad invoices caught, 15 of 16 good ones auto-approved.",
    evidence: [site("invoiceguard", "InvoiceGuard"), { label: "Live demo", url: INVOICEGUARD_LIVE }],
    tags: ["project", "featured", "live", "ai", "llm", "evaluation"],
    content: {
      title: "InvoiceGuard",
      oneLiner: "AI reads the invoice. Then it has to prove it.",
      status: "live",
      featured: true,
      tags: ["ai"],
      problem: "AI extraction from documents can’t be trusted without checks.",
      built:
        "AI extracts invoice fields, proves every value against the original page, checks the math, and sends only doubtful invoices to a person, whose corrections become test cases.",
      highlights: [
        "6 of 6 bad invoices caught, and 15 of 16 good ones auto-approved.",
        "About $0.0005 per invoice. A model costing 20 times more changed no decisions.",
        "113 tests.",
      ],
    },
  },
  {
    id: "project-recordsync",
    type: "project",
    label: "RecordSync",
    summary:
      "A pipeline that validates, normalizes, and matches customer records from two systems into one golden record each, tracks where every field came from, and sends unclear matches to a person. 80 tests, same results on every re-run.",
    evidence: [site("recordsync", "RecordSync")],
    tags: ["project", "featured", "personal", "data", "data-quality"],
    content: {
      title: "RecordSync",
      oneLiner: "Two systems disagree about a customer. One record comes out.",
      status: "personal",
      featured: true,
      tags: ["data"],
      problem: "Customer records in two systems don’t agree.",
      built:
        "A pipeline that validates, normalizes, and matches records into one golden record each, tracks where every field came from, and sends unclear matches to a person.",
      highlights: ["80 tests.", "Same results on every re-run."],
    },
  },
  {
    id: "project-margin-radar",
    type: "project",
    label: "Margin Radar",
    summary:
      "A prototype agent, October 2026, that flags a business’s margin problems early, where every number in its briefs traces back to a SQL query. Tested on held-out data, with documentation of where it still fails.",
    dates: { start: "2026-10", end: "2026-10" },
    evidence: [site("margin-radar", "Margin Radar")],
    tags: ["project", "personal", "ai", "llm", "agents", "data"],
    content: {
      title: "Margin Radar",
      oneLiner: "An agent that flags a business’s margin problems early, where every number in its briefs traces back to a SQL query.",
      status: "personal",
      featured: false,
      date: "October 2026",
      tags: ["ai", "data"],
      highlights: ["Tested on held-out data, with documentation of where it still fails."],
      statusNotes: [{ state: "neutral", text: "Prototype" }],
    },
  },
  {
    id: "project-heatshift",
    type: "project",
    label: "HeatShift",
    summary: "A heat-safety planner built in about 75 minutes at IBM’s Bobathon.",
    evidence: [site("heatshift", "HeatShift")],
    tags: ["project", "hackathon"],
    content: {
      title: "HeatShift",
      oneLiner: "A heat-safety planner built in about 75 minutes at IBM’s Bobathon.",
      status: "hackathon",
      featured: false,
      tags: [],
      highlights: [],
    },
  },
];

const invoiceguard = site("invoiceguard", "InvoiceGuard");
const recordsync = site("recordsync", "RecordSync");

export const v5MetricNodes: MetricNode[] = [
  metric("invoiceguard-caught", "6 of 6", "bad invoices caught", "InvoiceGuard caught 6 of 6 bad invoices.", [invoiceguard, { label: "Live demo", url: INVOICEGUARD_LIVE }], ["invoiceguard", "evaluation"]),
  metric("invoiceguard-approved", "15 of 16", "good ones auto-approved", "InvoiceGuard auto-approved 15 of 16 good invoices.", [invoiceguard], ["invoiceguard", "evaluation"]),
  metric("invoiceguard-cost", "$0.0005", "per invoice, roughly. A model costing 20 times more changed no decisions.", "InvoiceGuard costs about $0.0005 per invoice; a model costing 20 times more changed no decisions.", [invoiceguard], ["invoiceguard", "cost"]),
  metric("invoiceguard-tests", "113", "tests", "InvoiceGuard has 113 tests.", [invoiceguard], ["invoiceguard", "testing"]),
  metric("recordsync-tests", "80", "tests", "RecordSync has 80 tests.", [recordsync], ["recordsync", "testing"]),
];

export const v5ArtifactNodes: ArtifactNode[] = [
  {
    id: "artifact-invoiceguard-live",
    type: "artifact",
    label: "InvoiceGuard live demo",
    summary: "InvoiceGuard, live demo.",
    evidence: [{ label: "InvoiceGuard live demo", url: INVOICEGUARD_LIVE }],
    tags: ["artifact", "live"],
    kind: "live",
    url: INVOICEGUARD_LIVE,
  },
];

const e = (from: string, type: Edge["type"], to: string, label?: string): Edge => ({ from, to, type, ...(label ? { label } : {}) });
const uses = (project: string, ...skills: (string | [string, string])[]): Edge[] =>
  skills.map((s) => (Array.isArray(s) ? e(project, "uses", `skill-${s[0]}`, s[1]) : e(project, "uses", `skill-${s}`)));

export const v5ProjectEdges: Edge[] = [
  e("project-invoiceguard", "achieved", "metric-invoiceguard-caught"),
  e("project-invoiceguard", "achieved", "metric-invoiceguard-approved"),
  e("project-invoiceguard", "achieved", "metric-invoiceguard-cost"),
  e("project-invoiceguard", "achieved", "metric-invoiceguard-tests"),
  ...uses("project-invoiceguard", "python", ["anthropic-claude-api", "Claude API"], "llm-evaluation"),
  { from: "project-invoiceguard", to: "problem-ungrounded-ai-output", type: "solved", metric: "metric-invoiceguard-caught" },
  e("project-invoiceguard", "produced", "artifact-invoiceguard-live"),
  e("project-recordsync", "achieved", "metric-recordsync-tests"),
  ...uses("project-recordsync", "python", "pydantic", "sqlite", "pytest"),
  ...uses("project-margin-radar", "python", "duckdb", ["anthropic-claude-api", "Claude API"]),
  e("project-margin-radar", "during", "education-ms-asu"),
  e("project-heatshift", "solved", "problem-heat-safety"),
];
