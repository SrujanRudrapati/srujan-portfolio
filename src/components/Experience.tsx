import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { experience } from "@/content/portfolio";
import { Section } from "./ui";

// Short summary: every role on one line. The full outcomes, and the projects
// done during each role, live in the Timeline lens of the Work section, so the
// page does not carry them at full length twice (runbook Phase 7).
export function Experience() {
  return (
    <Section id="experience" title="Experience">
      <ol className="divide-y divide-line border-y border-line">
        {experience.map((role) => (
          <li key={`${role.org}-${role.title}`} className="grid grid-cols-1 gap-x-8 gap-y-1 py-5 md:grid-cols-12">
            <p className="text-xs font-medium text-muted tabular-nums md:col-span-3 md:pt-1.5">{role.dates}</p>
            <div className="md:col-span-9">
              <h3 className="text-lg leading-snug text-ink md:text-xl">{role.title}</h3>
              <p className="mt-0.5 font-medium text-ink">
                {role.org}
                <span className="font-normal text-muted">, {role.place}</span>
              </p>
              {role.summary && <p className="mt-2 max-w-measure text-ink">{role.summary}</p>}
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-8">
        <a href="#lens=timeline" className="inline-flex min-h-11 items-center gap-2 font-medium text-accent-2 underline decoration-1 underline-offset-4 hover:text-accent-2-hover">
          See every outcome and project on the timeline
          <ArrowRightIcon aria-hidden="true" size={16} weight="bold" />
        </a>
      </p>
    </Section>
  );
}
