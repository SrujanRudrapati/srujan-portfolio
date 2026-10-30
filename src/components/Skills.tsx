import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { skills, type SkillGroup } from "@/content/portfolio";
import { Section, TagList } from "./ui";

// Short summary: each group with its first few skills. The full list, with how
// many projects use each skill, is the Skill map lens in the Work section.
const PREVIEW = 6;

const allItems = (g: SkillGroup): string[] => [...(g.items ?? []), ...(g.subgroups ?? []).flatMap((s) => s.items)];

export function Skills() {
  return (
    <Section id="skills" title="Skills">
      <div className="grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
        {skills.map((group) => {
          const items = [...new Set(allItems(group))];
          const rest = items.length - PREVIEW;
          return (
            <section key={group.name} aria-labelledby={`skills-${slug(group.name)}`}>
              <h3 id={`skills-${slug(group.name)}`} className="mb-4 text-lg text-ink">
                {group.name}
              </h3>
              <TagList items={items.slice(0, PREVIEW)} label={`${group.name} skills`} />
              {rest > 0 && <p className="mt-2 text-sm text-muted tabular-nums">and {rest} more</p>}
            </section>
          );
        })}
      </div>
      <p className="mt-10">
        <a href="#lens=skills" className="inline-flex min-h-11 items-center gap-2 font-medium text-accent-2 underline decoration-1 underline-offset-4 hover:text-accent-2-hover">
          See every skill and where it was used on the skill map
          <ArrowRightIcon aria-hidden="true" size={16} weight="bold" />
        </a>
      </p>
    </Section>
  );
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
