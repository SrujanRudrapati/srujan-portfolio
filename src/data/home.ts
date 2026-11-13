import { profile } from "../content/profile.ts";
import type { ThemeName } from "../lib/themes.ts";

// Everything the v5 home page says (design/redesign.html), as data. Wording is the prototype's;
// facts are the résumé's and the site's (portfolio-facts Sections 2 and 3, DECISIONS 26).
// Where the prototype said something the facts do not support, the comment says what changed.
// home.test.ts checks every project section against the graph.

export type HomeLink =
  | { label: string; href: string; external?: boolean }
  /** A link Srujan has not supplied yet: rendered as visible placeholder text, never as a dead link. */
  | { label: string; placeholder: string };

export type Figure = { value: string; label: string };
export type Part = { term: string; text: string };
export type CardKind = "pallet" | "invoice" | "label" | "sync" | "receipts";

/** The spread (design/redesign.html, update of 2026-11-13): three small drawings beside the main scene,
 *  in order v1, v2, v3, each with an HTML caption. The drawings are VIGNETTES[theme] in art/drawings.tsx. */
export type Spread = [string, string, string];

export type ProjectSection = {
  slug: string;
  theme: ThemeName;
  flip: boolean;
  kicker: string;
  lede: string;
  /** Giant heading lines, as drawn (uppercase), and the accessible name. */
  lines: string[];
  name: string;
  parts: Part[];
  figures: Figure[];
  stack: string[];
  links: HomeLink[];
  card: CardKind;
  spread: Spread;
  /** A visible placeholder line under the links (the DevHacks photo). */
  placeholder?: string;
};

const page = (slug: string, label = "Read the case study"): HomeLink => ({ label, href: `/work/${slug}` });
const ext = (label: string, href: string): HomeLink => ({ label, href, external: true });

export const hero = {
  roles: "Data engineer · AI engineer",
  place: profile.location, // DECISIONS 26 L: "Phoenix, AZ"
  lines: ["SRUJAN", "RUDRAPATI"],
  headline: "I build cloud data pipelines and AI applications that run in production, and I make sure people can trust what they say.",
  availability: profile.availabilityLine, // DECISIONS 26 E
  cue: "Follow the line",
};

export const highlights: Figure[] = [
  { value: "2+", label: "years of data engineering" }, // résumé summary: "two years" at Celebal, Sep 2022 to Nov 2024
  { value: "Live", label: "an AI tool in production at ASU" }, // facts 2.1
  { value: "1st", label: "place at DevHacks" }, // facts 2.2
  { value: "5", label: "certifications" }, // facts 3.6
];

export const projectSections: ProjectSection[] = [
  {
    slug: "surplus-station",
    theme: "surplus",
    flip: false,
    kicker: "01 / Production case study",
    lede: "OCR and an offline model identify, grade and price surplus hardware.",
    lines: ["SURPLUS", "STATION"],
    name: "Surplus Station",
    parts: [
      { term: "Problem", text: "Staff at ASU Surplus were retyping laptop specs by hand." },
      {
        term: "What I built",
        // DECISIONS 26 I (default): the site's hardware and tools, not the prototype's "PowerShell, macOS and Windows";
        // "in seconds" dropped (no source).
        text: "OCR reads hardware labels, and a self-hosted Qwen 14B model running offline across four Mac minis, with Llama 3B on a fifth, identifies, grades, and prices items. A Bash script on a USB stick pulls a Mac’s specs.",
      },
    ],
    figures: [
      { value: "~80%", label: "less time per item, in production" }, // DECISIONS 26 H; "daily" dropped (no source)
      { value: "~10 min", label: "for a 100+ unit pallet of listings, down from 1 to 2 hours" }, // facts 2.1
    ],
    stack: ["Python", "Flask", "OCR", "MLX", "Qwen", "Bash"], // PowerShell dropped (DECISIONS 26 I)
    links: [page("surplus-station")],
    // facts 2.1; "In daily production use" → "In production" ("daily" has no source, as in the figure above).
    spread: ["100+ unit pallet", "About 10 min a pallet, was 1 to 2 h", "In production"],
    card: "pallet",
  },
  {
    slug: "invoiceguard",
    theme: "invoice",
    flip: true,
    kicker: "02 / Live demo",
    lede: "AI reads the invoice. Then it has to prove it.",
    lines: ["INVOICE", "GUARD"],
    name: "InvoiceGuard",
    parts: [
      { term: "Problem", text: "AI extraction from documents can’t be trusted without checks." },
      {
        term: "What I built",
        text: "AI extracts invoice fields, proves every value against the original page, checks the math, and sends only doubtful invoices to a person, whose corrections become test cases.",
      },
    ],
    figures: [
      { value: "6 of 6", label: "bad invoices caught" },
      { value: "15 of 16", label: "good ones auto-approved" },
      { value: "$0.0005", label: "per invoice, roughly. A model costing 20 times more changed no decisions." },
      { value: "113", label: "tests" },
    ], // facts 3.2
    stack: ["Python", "Claude API", "LLM evaluation"],
    links: [
      ext("Open the live demo", "https://invoiceguard-srujan.onrender.com"),
      { label: "GitHub", placeholder: "Repository link to come" }, // DECISIONS 26 A: URL not supplied
      { label: "Watch the walkthrough", placeholder: "Walkthrough video to come" },
      page("invoiceguard", "Read more"),
    ],
    spread: ["Math checked", "Corrections become tests", "About $0.0005 an invoice"], // facts 3.2
    card: "invoice",
  },
  {
    slug: "label-lens",
    theme: "label",
    flip: false,
    kicker: "03 / Live app",
    lede: "Check a product label against your allergies and medications.",
    lines: ["LABEL", "LENS"],
    name: "Label Lens",
    parts: [
      { term: "Problem", text: "People can’t easily check product labels against their allergies and medications." },
      { term: "What I built", text: "A web app that reads labels from photos, where every AI warning must quote the label word for word." },
    ],
    figures: [
      { value: "44 of 44", label: "AI warnings verified to quote the label" }, // facts 2.3
      { value: "4 to 9 s", label: "response time, down from 16, by running two models in parallel" }, // dash removed (copy rule)
      { value: "62", label: "tests" }, // facts 2.3: 56 unit + 6 end-to-end
    ],
    stack: ["TypeScript", "Next.js", "Claude API", "zod", "Vitest", "Playwright"], // facts 2.3 (the prototype added React)
    links: [ext("Open the live app", "https://label-lens-iota.vercel.app"), page("label-lens", "Read more")],
    spread: ["Every warning quotes the label", "Two models in parallel", "16 s down to 4 to 9 s"], // facts 2.3
    card: "label",
  },
  {
    slug: "recordsync",
    theme: "sync",
    flip: true,
    kicker: "04 / Data engineering",
    lede: "Two systems disagree about a customer. One record comes out.",
    lines: ["RECORD", "SYNC"],
    name: "RecordSync",
    parts: [
      { term: "Problem", text: "Customer records in two systems don’t agree." },
      {
        term: "What I built",
        text: "A pipeline that validates, normalizes, and matches records into one golden record each, tracks where every field came from, and sends unclear matches to a person.",
      },
    ],
    figures: [
      { value: "80", label: "tests" },
      { value: "Same", label: "results on every re-run" },
    ], // facts 3.3
    stack: ["Python", "pydantic", "SQLite", "pytest"],
    links: [{ label: "GitHub", placeholder: "Repository link to come" }, page("recordsync", "Read more")], // DECISIONS 26 B
    spread: ["Unclear matches go to a person", "Same result, every run", "Every field keeps its source"], // facts 3.3
    card: "sync",
  },
  {
    slug: "devhacks-cubbie",
    theme: "hacks",
    flip: false,
    kicker: "05 / Hackathon, 1st place",
    lede: "Track 1 winner among 82 submissions from 350+ students.",
    lines: ["DEV", "HACKS"],
    name: "DevHacks",
    parts: [
      { term: "What happened", text: "Our team won Track 1 among 82 submissions from 350+ students. Cooked scores a student’s week from Canvas deadlines." },
      { term: "What I built", text: "Receipts, a Discord agent that tracks commitments made in chat." },
    ],
    figures: [
      { value: "1 of 82", label: "submissions, Track 1" },
      { value: "493", label: "tests in CI" },
    ], // facts 2.2
    stack: [],
    links: [
      // The prototype's single "Repos" link pointed at the profile; facts 2.2 has both repositories.
      ext("Cooked repo", "https://github.com/SrujanRudrapati/cooked"),
      ext("Receipts repo", "https://github.com/SrujanRudrapati/receipts"),
      { label: "Watch the demo", placeholder: "Demo video to come" },
      page("devhacks-cubbie", "Read more"),
    ],
    // facts 2.2. "493 tests in CI" names Receipts (the tests are Receipts', not the team's or Cooked's);
    // "350+ students, 82 entries" uses the facts' "submissions" ("entries" is the site's word for the team's builds).
    spread: ["Cooked: your week, scored", "Receipts: 493 tests in CI", "82 submissions from 350+ students"],
    card: "receipts",
    placeholder: "Photo from the event to come",
  },
];

export const celebal = {
  theme: "celebal" as ThemeName,
  kicker: "06 / Professional work, client names removed",
  // The résumé says "for US clients", but the graph's telehealth client is in New Zealand: "US" left out until Srujan
  // answers (STATUS, open questions).
  lede: "Cloud warehouses and lakehouses for clients in healthcare, energy, manufacturing, and e-commerce.",
  lines: ["CELEBAL"],
  name: "Celebal Technologies",
  // facts 2.4 and the Celebal role in the graph; "½" keeps its "about" marker as "~½".
  tiles: [
    { value: "~10M", label: "records a day through a production AWS pipeline I was on call for" }, // "about 10 million": marker kept
    { value: "~30%", label: "less downtime on that pipeline" },
    { value: "10 mo", label: "of Microsoft Purview work for a major US utility: glossary, lineage, automated catalog updates" },
    // The résumé says "Led"; the graph says "coordinated a five-person team". The graph's word is used until Srujan answers.
    { value: "~½", label: "the reporting time for a telehealth client, from a Microsoft Fabric pilot where I coordinated a five-person team" },
  ] satisfies Figure[],
  // facts 2.4 and the Celebal role in the graph.
  spread: ["Purview: glossary and lineage", "Reporting time, about half", "Healthcare, energy, manufacturing, e-commerce"] satisfies Spread,
  tickLede: "Ten million a day is about 116 records every second. At that pace, since you opened this page:",
  recordsPerDay: 10_000_000,
  link: { label: "Read about Celebal", href: "/experience" } satisfies HomeLink,
};

export type MoreRow = { slug: string; icon: string; name: string; text: string };

export const moreProjects: MoreRow[] = [
  // DECISIONS 26 D: résumé wording, not the prototype's "anomaly-detection agent".
  { slug: "margin-radar", icon: "margin-radar", name: "Margin Radar", text: "An agent that flags a business’s margin problems early, and documents where it still fails." },
  { slug: "supply-chain-watchtower", icon: "supply-chain-watchtower", name: "Supply Chain Watchtower", text: "Multi-agent system with RAG, on CrewAI and ChromaDB." },
  { slug: "heatshift", icon: "heatshift", name: "HeatShift", text: "A heat-safety planner built in about 75 minutes at IBM’s Bobathon." },
  { slug: "demand-forecasting", icon: "demand-forecasting", name: "Demand forecasting", text: "Capstone. Caught a leaking column; 27.7% error versus a 38.5% baseline." },
  // "automatic rollback" dropped (no source); the site's one-codebase line instead.
  { slug: "aws-cicd-pipeline", icon: "aws-cicd-pipeline", name: "AWS CI/CD pipeline", text: "Terraform, Docker, GitHub Actions. One codebase deploys dev or prod." },
  { slug: "wlan-forensics-toolkit", icon: "wlan-forensics-toolkit", name: "Network anomaly toolkit", text: "Caught a live denial-of-service attack." },
  { slug: "gesture-rc-car", icon: "gesture-rc-car", name: "Gesture-controlled RC car", text: "B.Tech major project, tested in Gazebo." },
];

export const skillGroups: { heading: string; items: string[] }[] = [
  { heading: "Data engineering", items: ["Databricks", "Snowflake", "Microsoft Fabric", "Microsoft Purview", "Warehouses and lakehouses", "Pipelines", "SQLite"] },
  { heading: "Cloud and DevOps", items: ["Azure", "AWS", "Terraform", "Docker", "GitHub Actions", "CI/CD"] },
  { heading: "AI and LLMs", items: ["Claude API", "LLM evaluation", "RAG", "CrewAI", "ChromaDB", "MLX", "Qwen", "OCR"] },
  { heading: "Software and web", items: ["Python", "TypeScript", "Next.js", "React", "Flask", "pydantic", "pytest", "Vitest", "Playwright", "Bash", "PowerShell"] },
];

export type Row = { title: string; text?: string; when?: string };

// DECISIONS 26 K: dates from the résumé; the B.Tech added.
export const experience: Row[] = [
  { title: "ASU Surplus", text: "Tech Assistant. Built and run Surplus Station, in production.", when: "Jun 2026 to present" },
  { title: "Arizona State University", text: "Graduate Teaching Assistant, Network Security and Wireless Networks.", when: "Aug 2025 to May 2026" },
  { title: "Celebal Technologies", text: "Data engineering, internship then Associate.", when: "Jul 2022 to Nov 2024" },
];

export const education: Row[] = [
  // Written out as Master's and Bachelor's (Srujan, 2026-11-13), and in the same shape so the two rows
  // read as a pair: degree in field, GPA, then graduating or graduated. The start of the M.S. is not in
  // the facts, so neither row gives a start year (the B.Tech ran 2019 to 2023).
  { title: "Arizona State University", text: "Master’s in Data Science, Analytics, and Engineering. GPA 3.96.", when: "Graduating December 2026" },
  { title: "Rajasthan Technical University", text: "Bachelor’s in Computer Science. GPA 3.38.", when: "Graduated 2023" },
];

export const contact = {
  line: `${profile.location}. ${profile.availabilityLine}`,
  heading: "Let’s talk.",
};
