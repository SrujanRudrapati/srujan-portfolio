import type { Metadata } from "next";
import { pageMeta } from "@/lib/meta";
import { About } from "@/components/About";
import { Credentials } from "@/components/Credentials";
import { AnimateInView } from "@/components/AnimateInView";
import { MedallionDiagram } from "@/components/MedallionDiagram";
import { Experience } from "@/components/Experience";
import { Skills } from "@/components/Skills";
import { PageHead } from "@/components/site/PageHead";

export const metadata: Metadata = pageMeta("/about", "About | Srujan Rudrapati", "Bio, experience, skills, certifications and education.");

// v2 sections moved here unchanged (docs/v3/IA.md): About, the medallion diagram from the v2 hero,
// Experience, Skills, Certifications and education.
export default function AboutPage() {
  return (
    <main id="main">
      <PageHead stage="about / source" title="About" />
      <About />
      {/* The v2 hero's diagram (source systems through bronze, silver and gold to serving and LLMs). */}
      <div className="px-gutter pb-section">
        <div className="mx-auto max-w-page">
          <AnimateInView className="w-full max-w-[520px]">
            <MedallionDiagram />
          </AnimateInView>
        </div>
      </div>
      <Experience />
      <Skills />
      <Credentials />
    </main>
  );
}
