// Small helpers the card components need. Kept apart from projects.ts so a
// client component can import them without pulling the whole graph into the
// browser bundle.

import type { ProjectStatus } from "./graph/types.ts";

export const statusLabel: Record<ProjectStatus, string> = {
  production: "Production",
  live: "Live",
  hackathon: "Hackathon",
  academic: "Academic",
  personal: "Personal",
};
