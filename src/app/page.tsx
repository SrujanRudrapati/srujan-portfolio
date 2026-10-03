import { About } from "@/components/About";
import { Contact, SiteFooter } from "@/components/Contact";
import { Credentials } from "@/components/Credentials";
import { Experience } from "@/components/Experience";
import { FeaturedWork } from "@/components/FeaturedWork";
import { Hero, SiteHeader } from "@/components/Hero";
import { OtherProjects } from "@/components/OtherProjects";
import { Skills } from "@/components/Skills";

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-accent px-4 py-2 font-medium text-on-accent focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">
        <Hero />
        <About />
        <FeaturedWork />
        <OtherProjects />
        <Experience />
        <Skills />
        <Credentials />
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}
