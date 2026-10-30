import type { Metadata } from "next";
import { pageMeta } from "@/lib/meta";
import { notFound } from "next/navigation";
import { PageHead } from "@/components/site/PageHead";
import { FeaturedCard } from "@/components/work/FeaturedCard";
import { projects } from "@/data/projects";

// One page per project (runbook V3), statically generated from the graph. V5 turns this
// into the full case-study template; for now it carries everything the v2 card had.

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  return p ? pageMeta(`/work/${p.slug}`, `${p.title} | Srujan Rudrapati`, p.oneLiner) : {};
}

export default async function ProjectPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const index = projects.findIndex((x) => x.slug === slug);
  if (index < 0) notFound();
  const p = projects[index];
  return (
    <main id="main">
      <PageHead stage={`work / ${p.slug}`} title={p.title} />
      <section aria-label={`${p.title} details`} className="px-gutter pb-section">
        <div className="mx-auto max-w-page">
          <FeaturedCard project={p} index={0} onPage />
        </div>
      </section>
    </main>
  );
}
