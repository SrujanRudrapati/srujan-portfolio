import type { ProjectStatus } from "@/data/graph/types";
import { statusLabel } from "@/data/project-helpers";

// Status vocabulary from the design-direction skill: a dot plus a word in
// cobalt. Filled dot = running somewhere real (production, live); word only for
// everything else. Never a dot alone, never a colour that means something on its own.
export function StatusBadge({ status }: { status: ProjectStatus }) {
  const running = status === "production" || status === "live";
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-accent">
      {running && <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent" />}
      {statusLabel[status]}
    </span>
  );
}
