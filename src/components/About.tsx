import { about } from "@/content/portfolio";
import { Section } from "./ui";

export function About() {
  return (
    <Section id="about" title="About">
      <p className="max-w-[60ch] text-xl text-ink md:text-2xl md:leading-snug">{about.join(" ")}</p>
    </Section>
  );
}
