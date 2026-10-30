import type { CSSProperties } from "react";
import { profile } from "@/content/portfolio";
import { HeroAsk } from "./ask/HeroAsk";
import { Button } from "./Button";
import { AnimateInView } from "./AnimateInView";
import { MedallionDiagram } from "./MedallionDiagram";
import { Container, TagList } from "./ui";

// Staggered entrance: each block gets an index that globals.css turns into a
// 70ms delay (.enter). Five blocks, 400ms each, finishes under 700ms. Skipped
// entirely under prefers-reduced-motion.
const enter = (index: number) => ({ "--i": index }) as CSSProperties;

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-heading">
      <Container className="grid grid-cols-1 gap-10 pt-10 pb-16 md:pt-20 md:pb-24 lg:grid-cols-12 lg:items-center lg:gap-12">
        <div className="lg:col-span-7">
          {/* No entrance fade on the headline: it is the largest paint, and fading it in delays LCP. */}
          <h1 id="hero-heading" className="text-4xl text-ink">
            {profile.headline}
          </h1>
          <p className="enter mt-5 max-w-[40ch] text-xl text-ink" style={enter(1)}>
            {profile.subline}
          </p>
          <p className="enter mt-4 max-w-[48ch] text-base text-muted tabular-nums" style={enter(1)}>
            {profile.now}
          </p>

          <div className="enter mt-8 flex flex-wrap gap-3" style={enter(2)}>
            <Button href="#work">See my work</Button>
            <Button variant="secondary" href="#contact">
              Get in touch
            </Button>
            <Button variant="ghost" href="#lens=recruiter">
              One-page summary
            </Button>
          </div>

          <div className="enter mt-8" style={enter(3)}>
            <TagList items={profile.proof} label="Highlights" size="md" tone="quiet" />
          </div>
          <div className="enter mt-6" style={enter(3)}>
            <HeroAsk />
          </div>
        </div>

        <div className="enter flex justify-center lg:col-span-5 lg:justify-end" style={enter(4)}>
          <AnimateInView className="w-full max-w-[300px] sm:max-w-[360px] lg:max-w-[460px]">
            <MedallionDiagram />
          </AnimateInView>
        </div>
      </Container>
    </section>
  );
}
