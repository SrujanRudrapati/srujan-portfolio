import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Credentials } from "@/components/Credentials";
import { Experience } from "@/components/Experience";
import { Hero } from "@/components/Hero";
import { Work } from "@/components/work/Work";
import { Skills } from "@/components/Skills";

// V3: the nav, footer, Ask panel and skip link moved to the root layout; the v2 sections
// stay here unchanged until V4 rebuilds the home page as the short pipeline story, and each
// also lives on its own route now (docs/v3/IA.md).
export default function Home() {
  return (
    <main id="main" className="pt-16">
      <Hero />
      <About />
      <Work />
      <Experience />
      <Skills />
      <Credentials />
      <Contact />
    </main>
  );
}
