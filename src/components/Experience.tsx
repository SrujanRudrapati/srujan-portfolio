import { experience, type Role } from "@/content/portfolio";
import { Section } from "./ui";

export function Experience() {
  return (
    <Section id="experience" title="Experience">
      <ol className="space-y-16 md:space-y-20">
        {experience.map((role) => (
          <li key={`${role.org}-${role.title}`}>
            <RoleBlock role={role} />
          </li>
        ))}
      </ol>
    </Section>
  );
}

function RoleBlock({ role }: { role: Role }) {
  const labelled = role.outcomes.some((o) => o.label);

  return (
    <article className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
      <header className="lg:col-span-4">
        <div className="lg:sticky lg:top-24">
          <p className="font-mono text-xs tabular-nums text-muted">{role.dates}</p>
          <h3 className="mt-3 font-display text-xl font-semibold leading-snug tracking-tight text-ink md:text-2xl">
            {role.title}
          </h3>
          <p className="mt-1 font-medium text-ink">{role.org}</p>
          <p className="mt-1 text-sm text-muted">{role.place}</p>
        </div>
      </header>

      <div className="lg:col-span-8">
        {role.summary && <p className="mb-8 max-w-[65ch] text-lg leading-relaxed text-ink">{role.summary}</p>}

        {labelled ? (
          <ul className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
            {role.outcomes.map((o) => (
              <li key={o.label} className="border-t border-line pt-4">
                <h4 className="font-medium leading-snug text-ink">{o.label}</h4>
                <p className="mt-2 leading-relaxed text-muted">{o.text}</p>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="max-w-[65ch] space-y-3">
            {role.outcomes.map((o) => (
              <li key={o.text} className="relative pl-5 leading-relaxed text-muted">
                <span aria-hidden="true" className="absolute top-[0.7em] left-0 h-px w-2.5 bg-accent" />
                {o.text}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
