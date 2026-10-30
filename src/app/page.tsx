import { About } from "@/components/About";
import { Contact, SiteFooter } from "@/components/Contact";
import { Credentials } from "@/components/Credentials";
import { Experience } from "@/components/Experience";
import { Hero } from "@/components/Hero";
import { SiteHeader } from "@/components/SiteNav";
import { Work } from "@/components/work/Work";
import { Skills } from "@/components/Skills";

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 bg-accent px-4 py-2 font-medium text-on-accent focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">
        <Hero />
        <About />
        <Work />
        <Experience />
        <Skills />
        <Credentials />
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}
