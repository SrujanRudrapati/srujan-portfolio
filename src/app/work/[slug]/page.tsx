import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectView } from "@/components/project/ProjectView";
import { projectPage } from "@/data/project-page";
import { projects } from "@/data/projects";
import { pageMeta } from "@/lib/meta";

// One page per project (runbook v4 W4), statically generated from the graph. Featured
// projects open on the art band, the smaller ones on a compact title; any section the
// graph has no data for is left out.

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
  const data = projectPage(slug);
  if (!data) notFound();
  return <ProjectView data={data} />;
}
