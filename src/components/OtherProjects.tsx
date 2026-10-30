import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { otherProjects, type Project } from "@/content/portfolio";
import { Card } from "./Card";
import { Stat } from "./Stat";
import { Section, TagList, TextLink } from "./ui";

// Alternating 7/5 and 5/7 spans keep the grid from reading as identical tiles.
const spans = ["lg:col-span-7", "lg:col-span-5", "lg:col-span-5", "lg:col-span-7", "lg:col-span-6", "lg:col-span-6"];

export function OtherProjects() {
  return (
    <Section id="projects" title="Other projects">
      <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12 lg:gap-6">
        {otherProjects.map((project, i) => (
          <li key={project.title} className={spans[i] ?? "lg:col-span-6"}>
            <ProjectCard project={project} />
          </li>
        ))}
      </ul>
    </Section>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Card as="article" className="flex h-full flex-col">
      <header>
        <p className="text-xs font-medium tabular-nums text-muted">
          <time>{project.date}</time>
          {project.context && <span> · {project.context}</span>}
        </p>
        <h3 className="mt-3 text-xl leading-snug text-ink">{project.title}</h3>
      </header>

      {project.figure && (
        <div className="mt-6">
          <Stat value={project.figure.value} label={project.figure.label} />
        </div>
      )}

      <p className="mt-4 max-w-[60ch] text-ink">{project.outcome}</p>
      {project.credit && <p className="mt-3 text-sm text-muted">{project.credit}</p>}

      <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-6">
        <TagList items={project.stack} label={`${project.title} stack`} />
        {project.repo && (
          <TextLink href={project.repo} external aria-label={`View Repo: ${project.title} on GitHub`} className="text-sm">
            View Repo
            <ArrowUpRightIcon aria-hidden="true" size={14} weight="bold" />
          </TextLink>
        )}
      </div>
    </Card>
  );
}
