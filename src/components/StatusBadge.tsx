import { statusLabel, type ProjectStatus } from "@/data/projects";

// Status vocabulary from the design-direction skill: a dot plus a word in
// cobalt. Filled dot = running somewhere real (production, live); word only for
// everything else. Never a dot alone, never a colour that means something on its own.
export function StatusBadge({ status }: { status: ProjectStatus }) {
  const running = status === "production" || status === "live";
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-2">
      {running && <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent-2" />}
      {statusLabel[status]}
    </span>
  );
}

export function StatusNoteChip({ state, children }: { state: "running" | "pending" | "neutral"; children: string }) {
  return (
    <span className="inline-flex items-center gap-2 border border-ink px-2.5 py-1 text-sm font-medium text-ink">
      {state === "running" && <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent-2" />}
      {state === "pending" && <span aria-hidden="true" className="h-2 w-2 rounded-full border-2 border-accent-2" />}
      {children}
    </span>
  );
}
