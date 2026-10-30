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

// Projects live in src/data/projects.ts (Phase 4).

export type Role = {
  title: string;
  org: string;
  place: string;
  dates: string;
  summary?: string;
  outcomes: { label?: string; text: string }[];
};

export const experience: Role[] = [
  {
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
  {
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
  {
    title: "Associate, Data Engineering",
    org: "Celebal Technologies",
    place: "Jaipur, India",
    dates: "September 2022 to November 2024",
    summary:
      "A data and AI consultancy. I worked on client engagements across healthcare, energy, manufacturing, and e-commerce, mostly on Azure Databricks.",
    outcomes: [
      {
        label: "Telehealth client in New Zealand, Microsoft Fabric",
        text: "Clinical and operations teams were waiting days for reports. I designed the Lakehouse architecture and coordinated a five-person team. Time-to-insight dropped about 50%, and the dashboards ended up in their weekly operational meetings.",
      },
      {
        label: "A US materials engineering client, AWS",
        text: "Ran a production pipeline on Glue, S3, and Redshift handling about 10 million records a day from 7+ source systems, and was on call for it. Cut downtime about 30% by tracing recurring failures to root causes instead of patching them.",
      },
      {
        label: "A major fashion e-commerce client, Databricks",
        text: "Kafka and Spark pipelines on Databricks modeling impressions, clicks, conversions, spend, and attribution, with Power BI dashboards on top.",
      },
      {
        label: "A major US utility, data governance (10 months)",
        text: "Their Microsoft Purview catalog was maintained by hand. I built automation on Databricks that pushed entities and custom classifications into Purview on a schedule, plus Apache Atlas lineage pipelines and a business glossary mapped to their governance policies.",
      },
      {
        label: "Medallion architecture on Databricks",
        text: "Built bronze, silver, and gold layers plus a serving layer on Azure Databricks and Delta Lake. Wrote the Spark transformations and dbt models.",
      },
      {
        label: "A US medical device manufacturer",
        text: "Audited their existing Azure Data Factory pipelines before changing anything, and shipped updates with zero disruption to production.",
      },
      {
        label: "A large FMCG client",
        text: "Data governance engineer, using Unity Catalog alongside Microsoft Purview to manage access, lineage, and classification across the Databricks workspace.",
      },
      {
        label: "Production ML pipeline",
        text: "Built the Spark and Databricks pipelines feeding a production machine learning model, worked with the data science team on feature engineering, and built the serving layer that delivered model-ready data.",
      },
      {
        label: "A/B testing",
        text: "Built the pipelines feeding experiment data, set up test and control assignment logic, and ran the statistical analysis on results.",
      },
      {
        label: "Performance and cost",
        text: "Tuned Spark jobs and SQL on Databricks for performance and cost.",
      },
      {
        label: "Code review and mentoring",
        text: "Reviewed teammates' code as senior data engineer on one project, and mentored two interns.",
      },
      {
        label: "Pre-sales",
        text: "Wrote Azure cloud architectures and Bill-of-Materials cost estimates, and presented them directly to prospective clients alongside the sales team.",
      },
    ],
  },
  {
    title: "Intern, Data Engineering",
    org: "Celebal Technologies",
    place: "Jaipur, India",
    dates: "July to August 2022",
    outcomes: [],
  },
];

export type SkillGroup = {
  name: string;
  items?: string[];
  subgroups?: { name: string; items: string[] }[];
};

export const skills: SkillGroup[] = [
  {
    name: "Data engineering",
    items: [
      "Python", "SQL", "Spark", "PySpark", "Databricks", "Delta Lake", "Unity Catalog",
      "Databricks Workflows", "dbt", "Kafka", "Airflow", "medallion architecture",
      "ETL/ELT", "dimensional modeling", "data warehousing",
    ],
  },
  {
    name: "Cloud",
    subgroups: [
      { name: "Azure", items: ["Databricks", "Data Factory", "Fabric", "ADLS", "Synapse"] },
      { name: "AWS", items: ["Glue", "S3", "Redshift", "Lambda", "EC2", "RDS", "IAM", "VPC", "CloudWatch", "ECR", "ECS"] },
      { name: "Other", items: ["Snowflake"] },
    ],
  },
  {
    name: "AI and ML",
    items: [
      "Anthropic Claude API", "RAG", "vector databases (ChromaDB)", "CrewAI", "agentic workflows",
      "MLX", "local LLM serving", "LightGBM", "Prophet", "scikit-learn", "forecasting",
      "clustering", "anomaly detection", "feature engineering",
    ],
  },
  {
    name: "Governance",
    items: ["Microsoft Purview", "Apache Atlas", "Unity Catalog", "metadata management", "data lineage"],
  },
  {
    name: "Infrastructure",
    items: ["Terraform", "Docker", "Kubernetes", "GitHub Actions", "CI/CD", "Linux", "Bash", "Flask"],
  },
  { name: "BI", items: ["Power BI", "Tableau", "Qlik"] },
];

export const certifications = [
  "Databricks Certified Data Engineer Professional",
  "AWS Certified AI Practitioner",
  "Microsoft Certified: Azure Data Engineer Associate",
  "Microsoft Certified: Azure Administrator Associate",
];

export const education = [
  {
    degree: "M.S. in Data Science, Analytics, and Engineering",
    school: "Arizona State University",
    dates: "Expected December 2026",
    gpa: "GPA 3.96 / 4.0",
  },
  {
    degree: "B.Tech in Computer Science",
    school: "Rajasthan Technical University",
    dates: "2019 to 2023",
    gpa: "GPA 3.38 / 4.0",
  },
];
