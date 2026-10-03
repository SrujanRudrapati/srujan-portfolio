import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { otherProjects, type Project } from "@/content/portfolio";
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
    <article className="flex h-full flex-col rounded-xl border border-transparent bg-raised p-6 transition-colors duration-150 hover:border-line md:p-8">
      <header>
        <p className="font-mono text-xs tabular-nums text-muted">
          <time>{project.date}</time>
          {project.context && <span> · {project.context}</span>}
        </p>
        <h3 className="mt-3 font-display text-xl font-semibold leading-snug tracking-tight text-ink md:text-[22px]">
          {project.title}
        </h3>
      </header>

      {project.figure && (
        <p className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-display text-4xl font-semibold tabular-nums tracking-tight text-ink">
            {project.figure.value}
          </span>
          <span className="text-sm text-muted">{project.figure.label}</span>
        </p>
      )}

      <p className="mt-4 max-w-[60ch] leading-relaxed text-muted">{project.outcome}</p>
      {project.credit && <p className="mt-3 text-sm leading-relaxed text-muted">{project.credit}</p>}

      <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-6">
        <TagList items={project.stack} label={`${project.title} stack`} />
        {project.repo && (
          <TextLink href={project.repo} external aria-label={`View ${project.title} repository on GitHub`} className="text-sm">
            View Repo
            <ArrowUpRightIcon aria-hidden="true" size={14} weight="bold" />
          </TextLink>
        )}
      </div>
    </article>
  );
}
