import type { Metadata } from "next";
import { About } from "@/components/About";
import { AnimateInView } from "@/components/AnimateInView";
import { Credentials } from "@/components/Credentials";
import { Experience } from "@/components/Experience";
import { MedallionDiagram } from "@/components/MedallionDiagram";
import { RailBlock, RailHead, RailPage } from "@/components/site/Rail";
import { Skills } from "@/components/Skills";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta("/about", "About | Srujan Rudrapati", "Bio, experience, skills, certifications and education.");

// The source of everything else (V6, on the rail): bio, the medallion diagram from the v2 hero,
// Experience, Skills, Certifications and education (docs/v3/IA.md).
export default function AboutPage() {
  return (
    <RailPage>
      <RailHead stage="about / source" title="About" />
      <About />
      {/* The v2 hero's diagram (source systems through bronze, silver and gold to serving and LLMs). */}
      <RailBlock>
        <AnimateInView className="w-full max-w-[520px]">
          <MedallionDiagram />
        </AnimateInView>
      </RailBlock>
      <Experience />
      <Skills />
      <Credentials />
    </RailPage>
  );
}
