import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { AboutView, PORTRAIT } from "@/components/about/AboutView";
import { facts, paragraphs, statement } from "@/data/about";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta("/about", "About | Srujan Rudrapati", "How I work, education, certifications and skills.");

// Runbook v4 W6: About. The portrait is used once public/images/portrait.jpg exists (checked at build).
export default function AboutPage() {
  const hasPhoto = existsSync(join(process.cwd(), "public", PORTRAIT));
  return <AboutView statement={statement} paragraphs={paragraphs} facts={facts()} hasPhoto={hasPhoto} />;
}
