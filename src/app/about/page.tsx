import type { Metadata } from "next";
import { pageMeta } from "@/lib/meta";
import { About } from "@/components/About";
import { Credentials } from "@/components/Credentials";
import { Experience } from "@/components/Experience";
import { Skills } from "@/components/Skills";
import { PageHead } from "@/components/site/PageHead";

export const metadata: Metadata = pageMeta("/about", "About | Srujan Rudrapati", "Bio, experience, skills, certifications and education.");

// v2 sections moved here unchanged (docs/v3/IA.md): About, Experience, Skills, Certifications and education.
export default function AboutPage() {
  return (
    <main id="main">
      <PageHead stage="about / source" title="About" />
      <About />
      <Experience />
      <Skills />
      <Credentials />
    </main>
  );
}
