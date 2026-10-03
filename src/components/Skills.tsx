import { skills } from "@/content/portfolio";
import { Section, TagList } from "./ui";

export function Skills() {
  return (
    <Section id="skills" title="Skills">
      <div className="grid grid-cols-1 gap-x-12 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
        {skills.map((group) => (
          <section key={group.name} aria-labelledby={`skills-${slug(group.name)}`}>
            <h3 id={`skills-${slug(group.name)}`} className="mb-4 font-display text-lg font-semibold tracking-tight text-ink">
              {group.name}
            </h3>
            {group.items && <TagList items={group.items} label={`${group.name} skills`} />}
            {group.subgroups && (
              <dl className="space-y-4">
                {group.subgroups.map((sub) => (
                  <div key={sub.name}>
                    <dt className="mb-2 text-sm font-medium text-muted">{sub.name}</dt>
                    <dd>
                      <TagList items={sub.items} label={`${sub.name} skills`} />
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </section>
        ))}
      </div>
    </Section>
  );
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
