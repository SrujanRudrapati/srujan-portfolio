// Project data. Phase 4 of docs/REDESIGN_RUNBOOK.md: one typed list, migrated
// field by field from src/content/portfolio.ts (commit 491260e). Every string
// here was already on the site; Phase 5 applies the Section 2 facts. Do not add
// numbers, titles, or client names that are not in .claude/skills/portfolio-facts.

export type ProjectStatus = "production" | "live" | "hackathon" | "academic" | "personal";

/** Filter facets. "ai" = an LLM or ML model does real work; "data" = a data pipeline or dataset is the job. */
export type ProjectTag = "ai" | "data";

export type Impact = { value: string; label: string };
export type ProjectLinks = { live?: string; repo?: string; writeup?: string };
export type StatusNote = { state: "running" | "pending" | "neutral"; text: string };

export type Project = {
  slug: string;
  title: string;
  oneLiner: string;
  status: ProjectStatus;
  /** Up to three figures, shown large and red. Only numbers that are already on the site. */
  impact: Impact[];
  highlights: string[];
  stack: string[];
  links: ProjectLinks;
  featured: boolean;
  /** Key into the diagram registry (src/components/diagrams). */
  diagram?: string;

  // Fields beyond the runbook schema. All optional, so nothing from the old site is dropped.
  date: string;
  context?: string;
  credit?: string;
  tags: ProjectTag[];
  problem?: string;
  built?: string;
  /** Expandable "How it works" block on a featured card. */
  details?: { heading: string; items: { name: string; text: string }[] };
  /** Diagrams shown inside the details block. */
  secondaryDiagrams?: string[];
  statusNotes?: StatusNote[];
  statusDetail?: string;
};

export const projects: Project[] = [
  {
    slug: "surplus-ai",
    title: "Surplus AI",
    oneLiner: "Private, offline AI system for ASU Surplus",
    status: "production",
    featured: true,
    date: "2026",
    context: "Built on the job, in active use",
    tags: ["ai", "data"],
    impact: [
      { value: "5", label: "Mac minis in an offline cluster" },
      { value: "14B", label: "Qwen model split across four nodes with MLX" },
    ],
    problem:
      "Surplus staff were typing hardware specs into a spreadsheet by hand, which introduced typos into the inventory. Writing product listings was also manual.",
    built:
      "One connected pipeline: collect specs, build a master spreadsheet, and have AI write the listings, all on a private network that never touches the internet.",
    highlights: [
      "Two model engines: Qwen 14B across four nodes, and Llama 3B on one node for quick responses. Replies stream word by word.",
      "Both spec sources land in one master inventory keyed on serial number, so a camera scan never overwrites real data from a working machine.",
      "A Listings tab builds a strict prompt from each row's real specs, and a Cluster tab polls each node over SSH every 5 seconds.",
    ],
    diagram: "surplus-pipeline",
    secondaryDiagrams: ["surplus-network", "surplus-privacy"],
    details: {
      heading: "How it works",
      items: [
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
    },
    statusNotes: [
      { state: "running", text: "3B engine runs now" },
      { state: "pending", text: "14B cluster engine in progress" },
    ],
    statusDetail:
      "Everything works except the 14B cluster engine, which is waiting on model files being copied to nodes 2 through 4.",
    stack: ["MLX", "Flask", "Bash", "Apple Vision OCR", "Qwen 14B", "Llama 3B"],
    links: {},
  },
  {
    slug: "supply-chain-watchtower",
    title: "Autonomous Supply Chain Watchtower",
    oneLiner: "Multi-agent LLM system",
    status: "personal",
    featured: true,
    date: "November 2025",
    context: "Personal project, built solo",
    tags: ["ai"],
    impact: [{ value: "3", label: "agents in sequence on the Claude API" }],
    problem: "Turning raw sales history into a logistics plan normally takes several manual steps by different people.",
    built:
      "Three agents running in sequence on the native Anthropic Claude API through CrewAI, each consuming the previous agent's output. The Risk Analyst has a custom tool backed by a retrieval-augmented generation pipeline over ChromaDB, so its output is grounded in real shipping-disruption data instead of model recall. Built with Claude Code.",
    highlights: [],
    diagram: "watchtower-flow",
    stack: ["Python", "Anthropic Claude API", "CrewAI", "RAG", "ChromaDB"],
    links: {},
  },
  {
    slug: "demand-forecasting",
    title: "Demand Forecasting & Inventory Optimization",
    oneLiner: "Forecasting demand across 250 SKU and warehouse series, with a strict time-based test window.",
    status: "academic",
    featured: false,
    date: "2026, in progress",
    context: "MS capstone, team of four",
    tags: ["ai", "data"],
    impact: [{ value: "27.7%", label: "WAPE vs. 38.5% naive baseline" }],
    highlights: [
      "Turned the forecast into a reorder-point policy that cuts simulated holding cost about 28% at comparable service levels.",
    ],
    credit: "Team project with Rakshit Govind Thota, Sanjana Parmareddy Gari, and Yashwanth Sai Tondapu.",
    stack: ["Python", "LightGBM", "Prophet", "scikit-learn"],
    links: {},
  },
  {
    slug: "aws-cicd-pipeline",
    title: "End-to-End CI/CD Deployment Pipeline",
    oneLiner: "Multi-tier AWS environment in Terraform, parameterized so one codebase deploys dev or prod.",
    status: "personal",
    featured: false,
    date: "October 2026",
    tags: [],
    impact: [],
    highlights: [
      "GitHub Actions runs tests on every push to main, builds a Docker image, pushes to ECR, and triggers a Terraform deploy.",
    ],
    stack: ["Terraform", "Docker", "GitHub Actions", "AWS"],
    links: { repo: "https://github.com/SrujanRudrapati/aws-cicd-pipeline" },
  },
  {
    slug: "wlan-forensics-toolkit",
    title: "WLAN Traffic Forensics Toolkit",
    oneLiner: "Rebuilds the network topology as a directed graph and classifies device types with K-Means clustering.",
    status: "academic",
    featured: false,
    date: "January to May 2026",
    context: "Built as a TA for ACO 430 under Prof. Feng Wang",
    tags: ["ai", "data"],
    impact: [{ value: "100,000+", label: "WPA2-encrypted packets parsed" }],
    highlights: ["A Z-score detector on top caught a live denial-of-service deauthentication attack."],
    stack: ["Python", "Pyshark", "NetworkX", "scikit-learn"],
    links: {},
  },
  {
    slug: "f1-race-predictor",
    title: "F1 Race Outcome Predictor",
    oneLiner: "Ranks drivers by win probability, with rolling features shifted forward to prevent look-ahead leakage.",
    status: "personal",
    featured: false,
    date: "March 2026",
    tags: ["ai"],
    impact: [{ value: "80%", label: "top-3 accuracy vs. 73% baseline" }],
    highlights: [
      "Backtested on 44 held-out races: 52% top-1 and 80% top-3 accuracy, against a 43% / 73% baseline.",
    ],
    stack: ["Python", "scikit-learn", "HistGradientBoosting"],
    links: {},
  },
  {
    slug: "flask-on-kubernetes",
    title: "Containerized Flask Service on Kubernetes",
    oneLiner:
      "Flask API with Postgres and Redis in a multi-stage Dockerfile, run locally through docker-compose and deployed to a local kind cluster.",
    status: "personal",
    featured: false,
    date: "September 2026",
    tags: [],
    impact: [],
    highlights: [],
    stack: ["Docker", "docker-compose", "Kubernetes (kind)"],
    links: {},
  },
  {
    slug: "java-group-chat",
    title: "Real-Time Group Chat Application",
    oneLiner: "Multi-client chat in Core Java.",
    status: "personal",
    featured: false,
    date: "2023",
    tags: [],
    impact: [],
    highlights: [
      "A server handles concurrent TCP socket connections and broadcasts messages, with client and server code kept modular.",
    ],
    stack: ["Java", "Swing", "AWT", "TCP sockets"],
    links: {},
  },
];

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
