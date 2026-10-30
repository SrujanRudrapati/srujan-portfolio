import { projects } from "@/data/projects";
import { Section } from "@/components/ui";
import { Explore } from "@/components/explore/Explore";
import { WorkExplorer } from "./WorkExplorer";

// Server component. The Highlights lens (projects selected from the graph at
// build time) is rendered here and passed into the client-side lens switcher,
// so the default view is static HTML.
export function Work() {
  return (
    <Section id="work" title="Work">
      <Explore>
        <WorkExplorer projects={projects} />
      </Explore>
    </Section>
  );
}
