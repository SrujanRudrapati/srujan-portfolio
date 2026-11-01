import { skills, type SkillGroup } from "@/content/portfolio";
import { Section, TagList } from "./ui";
import { withBasePath } from "@/lib/paths";

// Short summary: each group (and each Cloud subgroup) with its first few
// skills. The Skill map lens is the full view, with how many projects use each
// skill. The complete list also sits here, server-rendered behind a closed
// disclosure, so every skill stays in the static HTML.
const PREVIEW = 6;
const SUB_PREVIEW = 3;

function More({ rest }: { rest: number }) {
  return rest > 0 ? <p className="mt-1.5 text-sm text-muted tabular-nums">and {rest} more</p> : null;
}

function Preview({ group }: { group: SkillGroup }) {
  if (!group.subgroups) {
    const items = group.items ?? [];
    return (
      <>
        <TagList items={items.slice(0, PREVIEW)} label={`${group.name} skills`} />
        <More rest={items.length - PREVIEW} />
      </>
    );
  }
  return (
    <dl className="space-y-3">
      {group.subgroups.map((sub) => (
        <div key={sub.name}>
          <dt className="mb-1.5 text-sm font-medium text-muted">{sub.name}</dt>
          <dd>
            <TagList items={sub.items.slice(0, SUB_PREVIEW)} label={`${sub.name} skills`} />
            <More rest={sub.items.length - SUB_PREVIEW} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

function FullList() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
      {skills.map((group) => (
        <div key={group.name}>
          <p className="mb-3 font-semibold text-ink">{group.name}</p>
          {group.items && <TagList items={group.items} label={`All ${group.name} skills`} />}
          {group.subgroups?.map((sub) => (
            <div key={sub.name} className="mt-3">
              <p className="mb-1.5 text-sm font-medium text-muted">{sub.name}</p>
              <TagList items={sub.items} label={`All ${sub.name} skills`} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function Skills() {
  // Distinct skills: Databricks and Unity Catalog each sit in two groups.
  const total = new Set(skills.flatMap((g) => [...(g.items ?? []), ...(g.subgroups ?? []).flatMap((s) => s.items)])).size;
  return (
    <Section id="skills" stage="source / skills" title="Skills">
      <div className="grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
        {skills.map((group) => (
          <section key={group.name} aria-labelledby={`skills-${slug(group.name)}`}>
            <h3 id={`skills-${slug(group.name)}`} className="mb-4 text-lg text-ink">
              {group.name}
            </h3>
            <Preview group={group} />
          </section>
        ))}
      </div>
      <div className="mt-10 flex flex-col gap-2">
        <a href={withBasePath("/explore#lens=skills")} className="inline-flex min-h-11 w-fit items-center gap-2 font-medium text-accent-2 underline decoration-1 underline-offset-4 hover:text-accent-2-hover">
          See every skill and where it was used on the skill map
        </a>
        <details className="group">
          <summary className="inline-flex min-h-11 cursor-pointer list-none items-center text-sm font-medium text-ink underline decoration-line decoration-1 underline-offset-4 hover:decoration-accent-2 [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden tabular-nums">Show all {total} skills as a list</span>
            <span className="hidden group-open:inline">Hide the full list</span>
          </summary>
          <FullList />
        </details>
      </div>
    </Section>
  );
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
