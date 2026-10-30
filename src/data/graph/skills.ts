import type { SkillNode } from "./types.ts";

// Skill nodes in the order the Skills section lists them (that order is the
// render order). A skill in two groups has two entries in `groups`. Summaries
// are filled in by ./index.ts from the groups and the projects that use the skill.

const SKILLS = "/about#skills";

type Spec = [id: string, label: string, groups: { group: string; sub?: string; position?: number }[], tags?: string[]];

const de = (id: string, label: string, tags: string[] = []): Spec => [id, label, [{ group: "Data engineering" }], tags];
const azure = (id: string, label: string): Spec => [id, label, [{ group: "Cloud", sub: "Azure" }], ["azure"]];
const aws = (id: string, label: string): Spec => [id, label, [{ group: "Cloud", sub: "AWS" }], ["aws"]];
const ai = (id: string, label: string, tags: string[] = []): Spec => [id, label, [{ group: "AI and ML" }], tags];
const gov = (id: string, label: string): Spec => [id, label, [{ group: "Governance" }], ["governance"]];
const infra = (id: string, label: string): Spec => [id, label, [{ group: "Infrastructure" }], ["infrastructure"]];
const bi = (id: string, label: string): Spec => [id, label, [{ group: "BI" }], ["bi"]];
/** Appears in a project's stack but not in the Skills section. */
const tool = (id: string, label: string, tags: string[] = []): Spec => [id, label, [], tags];

const specs: Spec[] = [
  // Data engineering
  de("python", "Python", ["language", "core"]),
  de("sql", "SQL", ["language", "core"]),
  de("spark", "Spark", ["core"]),
  de("pyspark", "PySpark"),
  ["databricks", "Databricks", [{ group: "Data engineering" }, { group: "Cloud", sub: "Azure" }], ["azure", "core"]],
  de("delta-lake", "Delta Lake", ["core"]),
  ["unity-catalog", "Unity Catalog", [{ group: "Data engineering" }, { group: "Governance", position: 2 }], ["governance"]],
  de("databricks-workflows", "Databricks Workflows"),
  de("dbt", "dbt"),
  de("kafka", "Kafka", ["core"]),
  de("airflow", "Airflow"),
  de("medallion-architecture", "medallion architecture"),
  de("etl-elt", "ETL/ELT"),
  de("dimensional-modeling", "dimensional modeling"),
  de("data-warehousing", "data warehousing"),
  // Cloud: Azure
  azure("data-factory", "Data Factory"),
  azure("fabric", "Fabric"),
  azure("adls", "ADLS"),
  azure("synapse", "Synapse"),
  // Cloud: AWS
  aws("glue", "Glue"),
  aws("s3", "S3"),
  aws("redshift", "Redshift"),
  aws("lambda", "Lambda"),
  aws("ec2", "EC2"),
  aws("rds", "RDS"),
  aws("iam", "IAM"),
  aws("vpc", "VPC"),
  aws("cloudwatch", "CloudWatch"),
  aws("ecr", "ECR"),
  aws("ecs", "ECS"),
  // Cloud: Other
  ["snowflake", "Snowflake", [{ group: "Cloud", sub: "Other" }], []],
  // AI and ML
  ai("anthropic-claude-api", "Anthropic Claude API", ["llm", "core"]),
  ai("rag", "RAG", ["llm", "core"]),
  ai("vector-databases", "vector databases (ChromaDB)", ["llm"]),
  ai("crewai", "CrewAI", ["llm", "agents"]),
  ai("agentic-workflows", "agentic workflows", ["llm", "agents"]),
  ai("mlx", "MLX", ["llm"]),
  ai("local-llm-serving", "local LLM serving", ["llm"]),
  ai("lightgbm", "LightGBM", ["ml"]),
  ai("prophet", "Prophet", ["ml"]),
  ai("scikit-learn", "scikit-learn", ["ml"]),
  ai("forecasting", "forecasting", ["ml"]),
  ai("clustering", "clustering", ["ml"]),
  ai("anomaly-detection", "anomaly detection", ["ml"]),
  ai("feature-engineering", "feature engineering", ["ml"]),
  // Governance
  gov("microsoft-purview", "Microsoft Purview"),
  gov("apache-atlas", "Apache Atlas"),
  gov("metadata-management", "metadata management"),
  gov("data-lineage", "data lineage"),
  // Infrastructure
  infra("terraform", "Terraform"),
  infra("docker", "Docker"),
  infra("kubernetes", "Kubernetes"),
  infra("github-actions", "GitHub Actions"),
  infra("ci-cd", "CI/CD"),
  infra("linux", "Linux"),
  infra("bash", "Bash"),
  infra("flask", "Flask"),
  // BI
  bi("power-bi", "Power BI"),
  bi("tableau", "Tableau"),
  bi("qlik", "Qlik"),
  // Stack-only tools (project chips that the Skills section does not list)
  tool("apple-vision-ocr", "Apple Vision OCR"),
  tool("qwen-14b", "Qwen 14B", ["llm"]),
  tool("llama-3b", "Llama 3B", ["llm"]),
  tool("nextjs", "Next.js", ["web"]),
  tool("typescript", "TypeScript", ["language", "web"]),
  tool("zod", "zod", ["web"]),
  tool("vitest", "Vitest", ["testing"]),
  tool("playwright", "Playwright", ["testing"]),
  tool("aws", "AWS", ["aws"]),
  tool("pyshark", "Pyshark", ["networking"]),
  tool("networkx", "NetworkX"),
  tool("histgradientboosting", "HistGradientBoosting", ["ml"]),
  tool("docker-compose", "docker-compose", ["infrastructure"]),
  tool("java", "Java", ["language"]),
  tool("swing", "Swing"),
  tool("awt", "AWT"),
  tool("tcp-sockets", "TCP sockets", ["networking"]),
  tool("arduino-cpp", "Arduino C++", ["language", "hardware"]),
  tool("adxl335", "ADXL335", ["hardware"]),
  tool("rf-ht12e-ht12d", "RF HT12E/HT12D", ["hardware"]),
  tool("l298", "L298", ["hardware"]),
  tool("gazebo", "Gazebo", ["simulation"]),
];

export const skillNodes: SkillNode[] = specs.map(([id, label, groups, tags = []]) => ({
  id: `skill-${id}`,
  type: "skill",
  label,
  summary: "",
  evidence: [{ label: "Skills section", url: SKILLS }],
  tags: ["skill", ...tags],
  groups,
}));

export { skillGroupOrder } from "./groups.ts";
