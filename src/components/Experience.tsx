import { experience, roleFigures } from "@/content/portfolio";
import { Section } from "./ui";
import { withBasePath } from "@/lib/paths";

// Short summary: every role on one line with its figures. The Timeline lens in
// the Work section is the full view (outcomes plus the projects done during
// each role). The outcomes also sit here, server-rendered behind a closed
// disclosure, so they stay in the static HTML for no-JS visitors and crawlers
// without showing at full length twice.
export function Experience() {
  return (
    <Section id="experience" stage="source / experience" title="Experience">
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
              {/* Roles without a summary lead with their first outcome (existing text), so no row is bare. */}
              {(role.summary ?? role.outcomes[0]?.text) && <p className="mt-2 max-w-measure text-ink">{role.summary ?? role.outcomes[0]?.text}</p>}
              {(roleFigures.get(`${role.title}|${role.org}`) ?? []).length > 0 && (
                <ul aria-label={`${role.title} figures`} className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                  {roleFigures.get(`${role.title}|${role.org}`)!.map((f) => (
                    <li key={f} className="font-semibold text-ink tabular-nums">
                      {f}
                    </li>
                  ))}
                </ul>
              )}
              {role.outcomes.length > 0 && (
                <details className="group mt-3">
                  <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm font-medium text-ink underline decoration-line decoration-1 underline-offset-4 hover:decoration-accent-2 [&::-webkit-details-marker]:hidden">
                    <span className="group-open:hidden">Show all {role.outcomes.length} outcomes</span>
                    <span className="hidden group-open:inline">Hide outcomes</span>
                  </summary>
                  <ul className="mt-2 max-w-measure space-y-3">
                    {role.outcomes.map((o) => (
                      <li key={o.label ?? o.text} className="text-ink">
                        {o.label && <span className="block font-semibold">{o.label}</span>}
                        {o.text}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-8">
        <a href={withBasePath("/explore#lens=timeline")} className="inline-flex min-h-11 items-center gap-2 font-medium text-accent-2 underline decoration-1 underline-offset-4 hover:text-accent-2-hover">
          See every outcome and project on the timeline
        </a>
      </p>
    </Section>
  );
}
