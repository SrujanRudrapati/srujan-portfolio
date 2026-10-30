import type { CertificationNode, Edge, EducationNode, MetricNode, RoleNode } from "./types.ts";
import { metric } from "./factories.ts";

// Roles, education and certifications, with the figures the Celebal bullets
// contain as metric nodes. Content strings are the Experience and Credentials
// sections verbatim (facts 2.4 applied in Phase 5).

const EXPERIENCE = "/about#experience";
const CREDENTIALS = "/about#credentials";

export const roleNodes: RoleNode[] = [
  {
    id: "role-tech-assistant-asu",
    type: "role",
    label: "Tech Assistant, Surplus Operations, Arizona State University",
    summary: "Built Surplus AI, a private, offline AI system for ASU Surplus, now in production. Also a Power BI dashboard on asset sorting data, and advice to departments and buyers on equipment.",
    dates: { start: "2026-06" },
    evidence: [{ label: "Experience", url: EXPERIENCE }],
    tags: ["role", "asu", "current"],
    content: {
      title: "Tech Assistant, Surplus Operations",
      org: "Arizona State University",
      place: "Tempe, AZ",
      dates: "June 2026 to present",
      outcomes: [
        { text: "Built Surplus AI, a private, offline AI system for ASU Surplus, now in production." },
        { text: "Built a Power BI dashboard on asset sorting data showing where items stall." },
        { text: "Advise university departments and outside buyers on what equipment fits their needs." },
      ],
    },
  },
  {
    id: "role-teaching-assistant-asu",
    type: "role",
    label: "Graduate Teaching Assistant, Arizona State University",
    summary: "Designed hands-on labs for two 400-level networking courses and held office hours for 40+ students. Built and presented the WLAN forensics toolkit to the class.",
    dates: { start: "2025-08", end: "2026-05" },
    evidence: [{ label: "Experience", url: EXPERIENCE }],
    tags: ["role", "asu", "teaching"],
    content: {
      title: "Graduate Teaching Assistant",
      org: "Arizona State University",
      place: "Network Security & Wireless Networks, Glendale, AZ",
      dates: "August 2025 to May 2026",
      outcomes: [
        { text: "Designed hands-on labs for two 400-level networking courses covering traffic analysis and packet-level debugging." },
        { text: "Held office hours for 40+ students." },
        { text: "Built and presented the WLAN forensics toolkit to the class." },
      ],
    },
  },
  {
    id: "role-associate-celebal",
    type: "role",
    label: "Associate, Data Engineering, Celebal Technologies",
    summary: "A data and AI consultancy. I worked on client engagements across healthcare, energy, manufacturing, and e-commerce, mostly on Azure Databricks.",
    dates: { start: "2022-09", end: "2024-11" },
    evidence: [{ label: "Experience", url: EXPERIENCE }],
    tags: ["role", "celebal", "data-engineering"],
    content: {
      title: "Associate, Data Engineering",
      org: "Celebal Technologies",
      place: "Jaipur, India",
      dates: "September 2022 to November 2024",
      summary: "A data and AI consultancy. I worked on client engagements across healthcare, energy, manufacturing, and e-commerce, mostly on Azure Databricks.",
      outcomes: [
        { label: "Telehealth client in New Zealand, Microsoft Fabric", text: "Clinical and operations teams were waiting days for reports. I designed the Lakehouse architecture and coordinated a five-person team. Time-to-insight dropped about 50%, and the dashboards ended up in their weekly operational meetings." },
        { label: "A US materials engineering client, AWS", text: "Ran a production pipeline on Glue, S3, and Redshift handling about 10 million records a day from 7+ source systems, and was on call for it. Cut downtime about 30% by tracing recurring failures to root causes instead of patching them." },
        { label: "A major fashion e-commerce client, Databricks", text: "Kafka and Spark pipelines on Databricks modeling impressions, clicks, conversions, spend, and attribution, with Power BI dashboards on top." },
        { label: "A major US utility, data governance (10 months)", text: "Their Microsoft Purview catalog was maintained by hand. I built automation on Databricks that pushed entities and custom classifications into Purview on a schedule, plus Apache Atlas lineage pipelines and a business glossary mapped to their governance policies." },
        { label: "Medallion architecture on Databricks", text: "Built bronze, silver, and gold layers plus a serving layer on Azure Databricks and Delta Lake. Wrote the Spark transformations and dbt models." },
        { label: "A US medical device manufacturer", text: "Audited their existing Azure Data Factory pipelines before changing anything, and shipped updates with zero disruption to production." },
        { label: "A large FMCG client", text: "Data governance engineer, using Unity Catalog alongside Microsoft Purview to manage access, lineage, and classification across the Databricks workspace." },
        { label: "Production ML pipeline", text: "Built the Spark and Databricks pipelines feeding a production machine learning model, worked with the data science team on feature engineering, and built the serving layer that delivered model-ready data." },
        { label: "A/B testing", text: "Built the pipelines feeding experiment data, set up test and control assignment logic, and ran the statistical analysis on results." },
        { label: "Performance and cost", text: "Tuned Spark jobs and SQL on Databricks for performance and cost." },
        { label: "Code review and mentoring", text: "Reviewed teammates' code as senior data engineer on one project, and mentored two interns." },
        { label: "Pre-sales", text: "Wrote Azure cloud architectures and Bill-of-Materials cost estimates, and presented them directly to prospective clients alongside the sales team." },
      ],
    },
  },
  {
    id: "role-intern-celebal",
    type: "role",
    label: "Intern, Data Engineering, Celebal Technologies",
    summary: "Data engineering internship at Celebal Technologies in July and August 2022, before joining as Associate.",
    dates: { start: "2022-07", end: "2022-08" },
    evidence: [{ label: "Experience", url: EXPERIENCE }],
    tags: ["role", "celebal", "internship"],
    content: { title: "Intern, Data Engineering", org: "Celebal Technologies", place: "Jaipur, India", dates: "July to August 2022", outcomes: [] },
  },
];

export const educationNodes: EducationNode[] = [
  {
    id: "education-ms-asu",
    type: "education",
    label: "M.S. in Data Science, Analytics, and Engineering, Arizona State University",
    summary: "Expected December 2026. GPA 3.96 / 4.0.",
    dates: { end: "2026-12" },
    evidence: [{ label: "Education", url: CREDENTIALS }],
    tags: ["education", "asu"],
    content: { degree: "M.S. in Data Science, Analytics, and Engineering", school: "Arizona State University", dates: "Expected December 2026", gpa: "GPA 3.96 / 4.0" },
  },
  {
    id: "education-btech-rtu",
    type: "education",
    label: "B.Tech in Computer Science, Rajasthan Technical University",
    summary: "2019 to 2023. GPA 3.38 / 4.0.",
    dates: { start: "2019", end: "2023" },
    evidence: [{ label: "Education", url: CREDENTIALS }],
    tags: ["education"],
    content: { degree: "B.Tech in Computer Science", school: "Rajasthan Technical University", dates: "2019 to 2023", gpa: "GPA 3.38 / 4.0" },
  },
];

const cert = (id: string, label: string, summary: string, tags: string[]): CertificationNode => ({
  id: `certification-${id}`,
  type: "certification",
  label,
  summary,
  evidence: [{ label: "Certifications", url: CREDENTIALS }],
  tags: ["certification", ...tags],
});

export const certificationNodes: CertificationNode[] = [
  cert("databricks-de-professional", "Databricks Certified Data Engineer Professional", "Databricks' professional-level data engineering certification.", ["databricks"]),
  cert("aws-ai-practitioner", "AWS Certified AI Practitioner", "AWS's AI Practitioner certification.", ["aws", "ai"]),
  cert("azure-data-engineer", "Microsoft Certified: Azure Data Engineer Associate", "Microsoft's associate-level Azure data engineering certification.", ["azure"]),
  cert("azure-administrator", "Microsoft Certified: Azure Administrator Associate", "Microsoft's associate-level Azure administration certification.", ["azure"]),
];


export const roleMetricNodes: MetricNode[] = [
  metric("time-to-insight", "about 50%", "less time-to-insight", "For a telehealth client in New Zealand, on Microsoft Fabric. The dashboards ended up in their weekly operational meetings.", [{ label: "Experience", url: EXPERIENCE }], ["celebal"]),
  metric("records-per-day", "about 10 million", "records a day", "A production pipeline on Glue, S3, and Redshift from 7+ source systems, for a US materials engineering client.", [{ label: "Experience", url: EXPERIENCE }], ["celebal", "aws", "headline"]),
  metric("downtime", "about 30%", "less downtime", "By tracing recurring failures of the AWS pipeline to root causes instead of patching them.", [{ label: "Experience", url: EXPERIENCE }], ["celebal", "aws"]),
  metric("students", "40+", "students in office hours", "As Graduate Teaching Assistant for two 400-level networking courses.", [{ label: "Experience", url: EXPERIENCE }], ["asu", "teaching"]),
];

export const roleEdges: Edge[] = [
  { from: "role-associate-celebal", to: "metric-time-to-insight", type: "achieved" },
  { from: "role-associate-celebal", to: "metric-records-per-day", type: "achieved" },
  { from: "role-associate-celebal", to: "metric-downtime", type: "achieved" },
  { from: "role-teaching-assistant-asu", to: "metric-students", type: "achieved" },
  { from: "role-associate-celebal", to: "industry-healthcare", type: "in" },
  { from: "role-associate-celebal", to: "industry-energy", type: "in" },
  { from: "role-associate-celebal", to: "industry-manufacturing", type: "in" },
  { from: "role-associate-celebal", to: "industry-e-commerce", type: "in" },
  { from: "role-associate-celebal", to: "industry-consumer-goods", type: "in" },
  { from: "role-tech-assistant-asu", to: "industry-higher-ed-surplus", type: "in" },
  { from: "role-teaching-assistant-asu", to: "industry-higher-education", type: "in" },
  { from: "role-teaching-assistant-asu", to: "industry-network-security", type: "in" },
  // Skills the role bullets name, so the Skill map can count them.
  ...["databricks", "spark", "dbt", "delta-lake", "kafka", "medallion-architecture", "microsoft-purview", "apache-atlas", "unity-catalog", "fabric", "data-factory", "glue", "s3", "redshift", "power-bi", "sql", "feature-engineering", "data-lineage", "metadata-management"].map(
    (skill): Edge => ({ from: "role-associate-celebal", to: `skill-${skill}`, type: "uses" }),
  ),
  { from: "role-tech-assistant-asu", to: "skill-power-bi", type: "uses" },
  { from: "role-associate-celebal", to: "problem-slow-reporting", type: "solved", metric: "metric-time-to-insight" },
  { from: "role-associate-celebal", to: "problem-pipeline-downtime", type: "solved", metric: "metric-downtime" },
  { from: "role-associate-celebal", to: "problem-pipeline-cost", type: "solved" },
  { from: "role-associate-celebal", to: "problem-manual-governance", type: "solved" },
];
