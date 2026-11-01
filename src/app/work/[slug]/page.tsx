import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudy } from "@/components/case/CaseStudy";
import { caseStudy } from "@/data/case-study";
import { projects } from "@/data/projects";
import { pageMeta } from "@/lib/meta";

// One case study per project (runbook V5), statically generated from the graph. The
// template leaves out any section the graph has no data for, so shorter projects get a
// compact page from the same component.

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
  const data = caseStudy(slug);
  if (!data) notFound();
  return <CaseStudy data={data} />;
}
