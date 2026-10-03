// All copy and metrics come from PORTFOLIO_BRIEF.md. Do not add numbers,
// titles, or client names that are not in the brief.

export const profile = {
  name: "Srujan Rudrapati",
  headline: "I build the data layer, and the AI on top of it.",
  subline:
    "Data engineer working across Databricks, Azure, and AWS. Lately building LLM systems that run on real data.",
  location: "Phoenix, Arizona",
  status: "Graduating December 2026, available early 2027",
  email: "srujanrudrapati07@gmail.com",
  linkedin: "https://www.linkedin.com/in/srujan-rudrapati",
  linkedinLabel: "linkedin.com/in/srujan-rudrapati",
  github: "https://github.com/SrujanRudrapati",
  githubLabel: "github.com/SrujanRudrapati",
  resume: "/resume.pdf",
};

// Written for the site from facts in the brief (the brief asks for 3-4 sentences but gives no draft).
export const about = [
  "I'm a data engineer finishing an M.S. in Data Science, Analytics, and Engineering at Arizona State University.",
  "Before that I spent two years at Celebal Technologies building data platforms on Azure Databricks for clients in healthcare, energy, and manufacturing.",
  "Lately I build LLM systems that run on real data, like a private, offline AI system for ASU Surplus.",
  "I graduate in December 2026 and I'm available early 2027.",
];

export const surplusAI = {
  title: "Surplus AI",
  tagline: "Private, offline AI system for ASU Surplus",
  date: "2026",
  context: "Built on the job, in active use",
  problem:
    "Surplus staff were typing hardware specs into a spreadsheet by hand, which introduced typos into the inventory. Writing product listings was also manual.",
  built:
    "One connected pipeline: collect specs, build a master spreadsheet, and have AI write the listings, all on a private network that never touches the internet.",
  pipeline: {
    inputs: [
      { name: "USB spec collector", detail: "system_profiler on each working Mac" },
      { name: "Camera scanner", detail: "Vision OCR on the bottom label" },
    ],
    steps: [
      { name: "Lookup table", detail: "Product, year, screen size, resale lane" },
      { name: "Master inventory", detail: "Keyed on serial number" },
      { name: "LLM", detail: "Strict prompt: never invent specs" },
      { name: "Listings", detail: "Results saved" },
    ],
  },
  parts: [
    {
      name: "Five-node cluster",
      text: "Five M1 Mac minis on a gigabit switch with no internet uplink, fixed IPs, and passwordless SSH from the head node. Apple's MLX framework splits one model across several machines with tensor parallelism, so a 14B model can run across Macs that can't hold it individually.",
    },
    {
      name: "USB spec collector",
      text: "A Bash script on a USB stick runs system_profiler on each Mac, reads model, chip, RAM, storage, battery health, and macOS version, looks up year and screen size from a reference table, and de-duplicates by serial number.",
    },
    {
      name: "Camera inventory scanner",
      text: "For Macs that won't boot, a webcam photographs the bottom label and Apple's Vision OCR reads the model number, EMC, and serial. These are matched against the lookup table to get product, year, screen size, and resale lane (Retail, Auction, or Parts).",
    },
    {
      name: "Merge logic",
      text: "Both sources land in one master inventory keyed on serial number, so a camera scan never overwrites real data from a working machine.",
    },
    {
      name: "Surplus AI app",
      text: "A Flask server runs two model engines: Qwen 14B across four nodes, and Llama 3B on one node for quick responses. Replies stream word by word. A Listings tab builds a strict prompt from each row's real specs, and a Cluster tab polls each node over SSH every 5 seconds.",
    },
    {
      name: "Launchers",
      text: "One double-click starts everything, waits for the engines to respond, and opens the app. Closing it shuts down every node.",
    },
  ],
  nodes: [
    { ip: "10.0.0.1", role: "Head node", pending: false },
    { ip: "10.0.0.2", role: "", pending: true },
    { ip: "10.0.0.3", role: "", pending: true },
    { ip: "10.0.0.4", role: "", pending: true },
    { ip: "10.0.0.5", role: "", pending: false },
  ],
  privacyLayers: [
    "No uplink on the switch",
    "Wi-Fi off",
    "HF_HUB_OFFLINE=1, so the model software can't download anything",
    "Model server only answers on localhost",
  ],
  privacyNote: "The app checks Wi-Fi and internet status live.",
  status: {
    running: "3B engine runs now",
    pending: "14B cluster engine in progress",
    detail:
      "Everything works except the 14B cluster engine, which is waiting on model files being copied to nodes 2 through 4.",
  },
  stack: ["MLX", "Flask", "Bash", "Apple Vision OCR", "Qwen 14B", "Llama 3B"],
};

export const watchtower = {
  title: "Autonomous Supply Chain Watchtower",
  tagline: "Multi-agent LLM system",
  date: "November 2025",
  context: "Personal project, built solo",
  problem:
    "Turning raw sales history into a logistics plan normally takes several manual steps by different people.",
  built:
    "Three agents running in sequence on the native Anthropic Claude API through CrewAI, each consuming the previous agent's output. The Risk Analyst has a custom tool backed by a retrieval-augmented generation pipeline over ChromaDB, so its output is grounded in real shipping-disruption data instead of model recall. Built with Claude Code.",
  agents: ["Inventory Forecaster", "Risk Analyst", "Logistics Coordinator"],
  tool: { name: "RAG tool", detail: "ChromaDB, shipping-disruption data" },
  input: "Sales history",
  output: "Logistics plan",
  status: "Personal prototype",
  stack: ["Python", "Anthropic Claude API", "CrewAI", "RAG", "ChromaDB"],
  repo: null, // TODO: repo link
};

export type Project = {
  title: string;
  date: string;
  context?: string;
  /** Optional headline figure, copied verbatim from the brief. */
  figure?: { value: string; label: string };
  outcome: string;
  credit?: string;
  stack: string[];
  /** null = no confirmed public repo yet. */
  repo: string | null;
};

export const otherProjects: Project[] = [
  {
    title: "Demand Forecasting & Inventory Optimization",
    date: "2026, in progress",
    context: "MS capstone, team of four",
    figure: { value: "27.7%", label: "WAPE vs. 38.5% naive baseline" },
    outcome:
      "Forecasting demand across 250 SKU and warehouse series, with a strict time-based test window. Turned the forecast into a reorder-point policy that cuts simulated holding cost about 28% at comparable service levels.",
    credit:
      "Team project with Rakshit Govind Thota, Sanjana Parmareddy Gari, and Yashwanth Sai Tondapu.",
    stack: ["Python", "LightGBM", "Prophet", "scikit-learn"],
    repo: null, // TODO: repo link
  },
  {
    title: "End-to-End CI/CD Deployment Pipeline",
    date: "October 2026",
    outcome:
      "Multi-tier AWS environment in Terraform, parameterized so one codebase deploys dev or prod. GitHub Actions runs tests on every push to main, builds a Docker image, pushes to ECR, and triggers a Terraform deploy.",
    stack: ["Terraform", "Docker", "GitHub Actions", "AWS"],
    repo: "https://github.com/SrujanRudrapati/aws-cicd-pipeline",
  },
  {
    title: "WLAN Traffic Forensics Toolkit",
    date: "January to May 2026",
    context: "Built as a TA for ACO 430 under Prof. Feng Wang",
    figure: { value: "100,000+", label: "WPA2-encrypted packets parsed" },
    outcome:
      "Rebuilds the network topology as a directed graph and classifies device types with K-Means clustering. A Z-score detector on top caught a live denial-of-service deauthentication attack.",
    stack: ["Python", "Pyshark", "NetworkX", "scikit-learn"],
    repo: null, // TODO: repo link
  },
  {
    title: "F1 Race Outcome Predictor",
    date: "March 2026",
    figure: { value: "80%", label: "top-3 accuracy vs. 73% baseline" },
    outcome:
      "Ranks drivers by win probability, with rolling features shifted forward to prevent look-ahead leakage. Backtested on 44 held-out races: 52% top-1 and 80% top-3 accuracy, against a 43% / 73% baseline.",
    stack: ["Python", "scikit-learn", "HistGradientBoosting"],
    repo: null, // TODO: repo link
  },
  {
    title: "Containerized Flask Service on Kubernetes",
    date: "September 2026",
    outcome:
      "Flask API with Postgres and Redis in a multi-stage Dockerfile, run locally through docker-compose and deployed to a local kind cluster.",
    stack: ["Docker", "docker-compose", "Kubernetes (kind)"],
    repo: null, // TODO: repo link
  },
  {
    title: "Real-Time Group Chat Application",
    date: "2023",
    outcome:
      "Multi-client chat in Core Java. A server handles concurrent TCP socket connections and broadcasts messages, with client and server code kept modular.",
    stack: ["Java", "Swing", "AWT", "TCP sockets"],
    repo: null, // TODO: repo link
  },
];

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
    dates: "May 2026 to present",
    outcomes: [
      { text: "Built Surplus AI, a private, offline AI system for ASU Surplus." },
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
      "A data and AI consultancy. I worked on client engagements across healthcare, energy, and manufacturing, mostly on Azure Databricks.",
    outcomes: [
      {
        label: "Telehealth client in New Zealand, Microsoft Fabric",
        text: "Clinical and operations teams were waiting days for reports. I designed the Lakehouse architecture and coordinated a five-person team. Time-to-insight dropped about 50%, and the dashboards ended up in their weekly operational meetings.",
      },
      {
        label: "A US materials engineering client, AWS",
        text: "Ran a production pipeline on Glue, S3, and Redshift handling about 10 million records a day from 7+ source systems. Cut downtime about 30% by tracing recurring failures to root causes instead of patching them.",
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
        label: "Pre-sales",
        text: "Wrote Azure cloud architectures and Bill-of-Materials cost estimates, and presented them directly to prospective clients alongside the sales team.",
      },
    ],
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
