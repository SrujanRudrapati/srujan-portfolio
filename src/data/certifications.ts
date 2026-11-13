import { graph } from "./graph.ts";

// The Certified cards on the home page. Names come from the graph's certification nodes (facts 3.6),
// so a card cannot drift from the rest of the site; this file adds what a card shows besides the
// name. Order is the prototype's.
//
// Badges: the official images go in public/badges/ under the file names below (any of .png, .svg,
// .webp, .jpg), used as they are. Until a file exists, its card shows a marked placeholder frame.
// Verify links: add `verifyUrl` to an entry and its card shows a "Verify" link; nothing else changes.

export type CertificationCard = {
  /** The graph node id (certification-…). */
  id: string;
  /** Full certification name, from the graph. */
  name: string;
  issuer: string;
  /** File name in public/badges/ without the extension. */
  badge: string;
  /** The credential's public verification page, when Srujan supplies it. */
  verifyUrl?: string;
};

type Entry = Omit<CertificationCard, "name">;

const ENTRIES: Entry[] = [
  { id: "certification-databricks-de-professional", issuer: "Databricks", badge: "databricks-data-engineer-professional" },
  { id: "certification-fabric-analytics-engineer", issuer: "Microsoft", badge: "microsoft-fabric-analytics-engineer-associate" },
  { id: "certification-azure-data-engineer", issuer: "Microsoft", badge: "microsoft-azure-data-engineer-associate" },
  { id: "certification-azure-administrator", issuer: "Microsoft", badge: "microsoft-azure-administrator-associate" },
  { id: "certification-aws-ai-practitioner", issuer: "Amazon Web Services", badge: "aws-certified-ai-practitioner" },
];

export const BADGE_DIR = "/badges";
export const BADGE_EXTENSIONS = [".svg", ".png", ".webp", ".jpg"] as const;

export function certificationCards(): CertificationCard[] {
  const certs = graph.nodes.filter((n) => n.type === "certification");
  const cards = ENTRIES.map((e) => {
    const node = certs.find((n) => n.id === e.id);
    if (!node) throw new Error(`certifications: ${e.id} is not in the graph`);
    return { ...e, name: node.label };
  });
  if (cards.length !== certs.length) throw new Error("certifications: a graph certification has no card");
  return cards;
}
