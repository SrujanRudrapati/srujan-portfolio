"use client";

import { useMemo, useState } from "react";
import type { Graph } from "@/data/graph/types";
import { selectAllProjectItems, selectSkillMap, selectSkillUsers, type SkillChip } from "@/data/graph/lenses";
import { LensItemList } from "./LensItemList";

// Skills grouped as in the Skills section. Each chip shows how many projects
// and roles use it; pressing one filters the list beneath. Skills nothing on
// the site uses yet are plain tags, not buttons.

function Chip({ chip, pressed, onToggle }: { chip: SkillChip; pressed: boolean; onToggle: () => void }) {
  if (chip.count === 0) {
    return <li className="inline-flex min-h-11 items-center border border-line px-2.5 text-xs font-medium text-muted">{chip.label}</li>;
  }
  return (
    <li>
      <button
        type="button"
        aria-pressed={pressed}
        onClick={onToggle}
        className={`inline-flex min-h-11 items-center gap-1.5 border px-2.5 text-xs font-medium transition-colors duration-150 ${
          pressed ? "border-ink bg-ink text-bg" : "border-ink text-ink hover:bg-surface"
        }`}
      >
        {chip.label}
        <span className="sr-only">, used in </span>
        <span className={`tabular-nums ${pressed ? "text-bg" : "text-accent-2"}`}>{chip.count}</span>
      </button>
    </li>
  );
}

export function SkillMapLens({ graph }: { graph: Graph }) {
  const groups = useMemo(() => selectSkillMap(graph), [graph]);
  const all = useMemo(() => selectAllProjectItems(graph), [graph]);
  const [selected, setSelected] = useState<SkillChip | null>(null);
  const items = selected ? selectSkillUsers(graph, selected.id) : all;
  const toggle = (chip: SkillChip) => setSelected((cur) => (cur?.id === chip.id ? null : chip));
  const chipList = (chips: SkillChip[], label: string) => (
    <ul aria-label={label} className="flex flex-wrap gap-1.5">
      {chips.map((c) => (
        <Chip key={c.id} chip={c} pressed={selected?.id === c.id} onToggle={() => toggle(c)} />
      ))}
    </ul>
  );

  return (
    <div className="space-y-12">
      <p className="text-sm text-muted">
        The number on a skill counts the projects and roles that use it. Pick one to list them. Grey skills are on my skills list but not tied to work on this site.
      </p>
      <div className="grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((g) => (
          <section key={g.name} aria-label={g.name}>
            <h4 className="mb-3 text-base text-ink">{g.name}</h4>
            {g.skills.length > 0 && chipList(g.skills, `${g.name} skills`)}
            {g.subgroups?.map((s) => (
              <div key={s.name} className="mt-3">
                <p className="mb-1.5 text-xs font-medium text-muted">{s.name}</p>
                {chipList(s.skills, `${s.name} skills`)}
              </div>
            ))}
          </section>
        ))}
      </div>
      <section aria-labelledby="skill-map-results">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
          <h4 id="skill-map-results" className="text-lg text-ink" aria-live="polite">
            {selected ? `Where ${selected.label} is used` : "All projects"}
          </h4>
          {selected && (
            <button type="button" onClick={() => setSelected(null)} className="min-h-11 text-sm font-medium text-accent-2 underline decoration-1 underline-offset-4 hover:text-accent-2-hover">
              Show all projects
            </button>
          )}
        </div>
        <LensItemList items={items} label={selected ? `Projects and roles using ${selected.label}` : "All projects"} />
      </section>
    </div>
  );
}
