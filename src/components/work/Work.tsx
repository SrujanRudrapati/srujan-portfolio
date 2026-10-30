import { projects } from "@/data/projects";
import { Section } from "@/components/ui";
import { WorkExplorer } from "./WorkExplorer";

// Server component: selects the projects from the graph at build time and hands
// the plain Project[] to the client-side explorer (filters need state).
export function Work() {
  return (
    <Section id="work" title="Work">
      <WorkExplorer projects={projects} />
    </Section>
  );
}
