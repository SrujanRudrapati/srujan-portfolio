"use client";

import { useEffect, useState } from "react";
import { SHOW_ALL_PROJECTS } from "@/components/explore/Explore";
import type { Project } from "@/data/graph/types";
import { FeaturedCard } from "./FeaturedCard";
import { ProjectCard } from "./ProjectCard";

// Filter chips, featured cards, then the compact grid. Filtering is client
// state only (no URL change); the default "All" view is what the static HTML
// contains, so the section is complete without JavaScript. `projects` arrives
// as a prop from the server-rendered Work section, so the browser bundle
// carries the Project[] view and not the whole graph.

const filters = [
  { id: "all", label: "All" },
  { id: "production", label: "Production" },
  { id: "ai", label: "AI/LLM" },
  { id: "data", label: "Data engineering" },
  { id: "hackathon", label: "Hackathon" },
] as const;

type FilterId = (typeof filters)[number]["id"];

function matches(p: Project, filter: FilterId): boolean {
  switch (filter) {
    case "all":
      return true;
    case "production":
      return p.status === "production";
    case "hackathon":
      return p.status === "hackathon";
    case "ai":
      return p.tags.includes("ai");
    case "data":
      return p.tags.includes("data");
  }
}

export function WorkExplorer({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<FilterId>("all");
  useEffect(() => {
    const showAll = () => setFilter("all");
    window.addEventListener(SHOW_ALL_PROJECTS, showAll);
    return () => window.removeEventListener(SHOW_ALL_PROJECTS, showAll);
  }, []);
  const visible = projects.filter((p) => matches(p, filter));
  const featured = visible.filter((p) => p.featured);
  const others = visible.filter((p) => !p.featured);

  return (
    <>
      <div className="mb-10 flex flex-wrap items-center gap-x-6 gap-y-3 md:mb-14">
        <span aria-hidden="true" className="text-sm font-medium text-muted">Filter</span>
        <ul aria-label="Filter projects" className="flex flex-wrap gap-2">
          {filters.map((f) => {
            const pressed = filter === f.id;
            return (
              <li key={f.id}>
                <button
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => setFilter(f.id)}
                  className={`inline-flex h-11 items-center border px-4 text-sm font-medium transition-colors duration-150 ${
                    pressed ? "border-ink bg-ink text-bg" : "border-line text-ink hover:border-ink"
                  }`}
                >
                  {f.label}
                </button>
              </li>
            );
          })}
        </ul>
        <p aria-live="polite" className="text-sm text-muted tabular-nums">
          {visible.length === projects.length ? `${projects.length} projects` : `${visible.length} of ${projects.length} projects`}
        </p>
      </div>

      {visible.length === 0 && (
        <p className="max-w-measure text-lg text-ink">
          Nothing matches this filter yet.{" "}
          <button type="button" onClick={() => setFilter("all")} className="font-medium text-accent-2 underline decoration-1 underline-offset-4 hover:text-accent-2-hover">
            Show all projects
          </button>
        </p>
      )}

      {featured.length > 0 && (
        <div className="space-y-10 md:space-y-14">
          {featured.map((p, i) => (
            <FeaturedCard key={p.slug} project={p} index={i} />
          ))}
        </div>
      )}

      {others.length > 0 && (
        <div id="projects" className={featured.length > 0 ? "mt-16 md:mt-24" : ""}>
          <h3 className="mb-6 text-xl text-ink md:mb-8">Other projects</h3>
          <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {others.map((p, i) => (
              <li key={p.slug}>
                <ProjectCard project={p} index={i} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
