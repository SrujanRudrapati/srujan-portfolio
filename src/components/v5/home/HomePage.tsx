import { projectSections } from "@/data/home";
import { Thread } from "../thread/Thread";
import { About } from "./About";
import { Celebal } from "./Celebal";
import { Contact } from "./Contact";
import { Hero } from "./Hero";
import { Highlights } from "./Highlights";
import { MoreProjects } from "./MoreProjects";
import { ProjectSection } from "./ProjectSection";
import s from "./home.module.css";

/** The v5 home (design/redesign.html): one long page, one thread through all of it. */
export function HomePage() {
  return (
    <main id="main" className={s.main}>
      <Thread />
      <Hero />
      <Highlights />
      {projectSections.map((p, i) => (
        <ProjectSection key={p.slug} data={p} id={i === 0 ? "work" : undefined} />
      ))}
      <Celebal />
      <MoreProjects />
      <About />
      <Contact />
    </main>
  );
}
