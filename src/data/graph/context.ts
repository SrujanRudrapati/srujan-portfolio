import type { EventNode, IndustryNode, ProblemNode } from "./types.ts";

// Industries, problems and events. Each summary restates facts that are on the
// project or role it belongs to; nothing here adds a claim.

const industry = (id: string, label: string, summary: string, tags: string[] = []): IndustryNode => ({
  id: `industry-${id}`,
  type: "industry",
  label,
  summary,
  evidence: [{ label: "Work", url: "/work" }],
  tags: ["industry", ...tags],
});

export const industryNodes: IndustryNode[] = [
  industry("higher-ed-surplus", "Higher-ed surplus", "University surplus operations: identifying, grading, pricing and listing hardware for resale. Surplus AI runs here."),
  industry("higher-education", "Higher education", "Students and teaching: a Canvas-reading study planner and two 400-level networking courses."),
  industry("e-commerce", "E-commerce", "A major fashion e-commerce client at Celebal: impressions, clicks, conversions, spend and attribution pipelines."),
  industry("healthcare", "Healthcare", "A telehealth client in New Zealand and a US medical device manufacturer, both at Celebal."),
  industry("energy", "Energy", "A major US utility, where the data governance work ran for 10 months."),
  industry("manufacturing", "Manufacturing", "A US materials engineering client with an AWS pipeline handling about 10 million records a day."),
  industry("consumer-goods", "Consumer goods", "A large FMCG client, where Unity Catalog and Microsoft Purview managed access, lineage and classification."),
  industry("consumer-health", "Consumer health", "Food and medicine labels checked against a person’s allergies and medications, in Label Lens."),
  industry("supply-chain", "Supply chain", "Demand forecasting, inventory policy and logistics planning: the capstone and the Watchtower prototype."),
  industry("network-security", "Network security", "WLAN traffic forensics and the network security course it was built for."),
  industry("motorsport", "Motorsport", "Formula 1 race outcomes, ranked by win probability and backtested on held-out races."),
  industry("robotics", "Robotics", "A hand gesture controlled RC car built as a B.Tech major project."),
];

const problem = (id: string, label: string, summary: string, tags: string[] = []): ProblemNode => ({
  id: `problem-${id}`,
  type: "problem",
  label,
  summary,
  evidence: [{ label: "Work", url: "/work" }],
  tags: ["problem", ...tags],
});

export const problemNodes: ProblemNode[] = [
  problem("manual-processing-bottleneck", "Manual processing bottleneck", "Staff typed hardware specs into a spreadsheet by hand and wrote listings manually. Surplus AI cut processing per item from about 15 min to about 3 min."),
  problem("ungrounded-ai-output", "Ungrounded AI output", "Surplus AI uses a strict never-invent prompt, Label Lens quotes the label word for word, and Watchtower grounds its risk analyst in ChromaDB."),
  problem("slow-reporting", "Slow reporting", "Clinical and operations teams were waiting days for reports. A Lakehouse on Microsoft Fabric dropped time-to-insight about 50%."),
  problem("pipeline-downtime", "Pipeline downtime", "An AWS pipeline handling about 10 million records a day kept failing in the same ways. Tracing recurring failures to root causes cut downtime about 30%."),
  problem("pipeline-cost", "Pipeline cost", "Spark jobs and SQL on Databricks tuned for performance and cost."),
  problem("manual-governance", "Governance by hand", "A Microsoft Purview catalog maintained by hand. Scheduled automation on Databricks pushed entities and classifications into Purview, with Apache Atlas lineage and a business glossary."),
  problem("inventory-cost", "Inventory cost", "Forecast error and holding cost across 250 SKU and warehouse series. A reorder-point policy on the forecast cut simulated holding cost about 28% at comparable service levels."),
  problem("manual-logistics-planning", "Manual logistics planning", "Turning raw sales history into a logistics plan normally takes several manual steps by different people. Three agents in sequence do it."),
  problem("deadline-overload", "Deadline overload", "Students juggling Canvas deadlines and grade weights. Cooked scores the week 0 to 100 and books study blocks after the student says yes."),
  problem("network-attack-detection", "Network attack detection", "Finding a live attack inside 100,000+ WPA2-encrypted packets. A Z-score detector caught a denial-of-service deauthentication attack."),
  problem("backtest-leakage", "Backtest leakage", "Rolling features shifted forward so predictions never see the future. 80% top-3 accuracy on 44 held-out races against a 73% baseline."),
  problem("manual-deployment", "Manual deployment", "One Terraform codebase deploys dev or prod; GitHub Actions tests, builds and deploys on every push to main."),
];

const event = (id: string, label: string, summary: string, dates: EventNode["dates"], evidence: EventNode["evidence"], tags: string[] = []): EventNode => ({
  id: `event-${id}`,
  type: "event",
  label,
  summary,
  dates,
  evidence,
  tags: ["event", ...tags],
});

export const eventNodes: EventNode[] = [
  event("devhacks-win", "1st place, DevHacks × Cubbie hackathon", "1st place, Track 1, among 82 submissions from 350+ students.", { start: "2026-10", end: "2026-10" }, [{ label: "DevHacks × Cubbie page", url: "/work/devhacks-cubbie" }], ["hackathon"]),
  event("asu-surplus-start", "Started at ASU Surplus", "Started as Tech Assistant, Surplus Operations at Arizona State University in June 2026. Surplus AI, built on the job, is in production there.", { start: "2026-06" }, [{ label: "Experience", url: "/experience" }, { label: "Surplus AI page", url: "/work/surplus-ai" }], ["role", "production"]),
  event("graduation", "M.S. graduation (expected)", "Expected December 2026 from Arizona State University. Available early 2027.", { start: "2026-12", end: "2026-12" }, [{ label: "Education", url: "/about#credentials" }], ["education"]),
];
