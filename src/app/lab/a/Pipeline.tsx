"use client";

import { useRef } from "react";
import { SceneSlot } from "@/components/three/SceneSlot";
import { StageHost } from "@/components/three/StageHost";
import { render3DTier } from "@/components/three/capability";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { LabFacts } from "../_lib/facts";
import { countUp, useLabMotion } from "../_lib/motion";
import { withBasePath } from "@/lib/paths";
import s from "./pipeline.module.css";

// Concept A: the site is a data pipeline and scrolling runs a record through it.
// One rail runs down the page; a packet rides it, scrubbed to scroll position,
// and changes state at each stage (bronze raw, silver cleaned, gold modeled, answer).
// V1.5: the hero is a physics particle stream (same states, same order) and the
// Surplus AI and Label Lens panels carry live 3D covers through one shared canvas.

const STAGES = [
  { id: "ingest", n: "01", state: "raw" },
  { id: "transform", n: "02", state: "cleaned" },
  { id: "serve", n: "03", state: "modeled" },
  { id: "query", n: "04", state: "answer" },
] as const;

const MEDALLION = [
  { tier: "bronze", sub: "raw" },
  { tier: "silver", sub: "cleaned" },
  { tier: "gold", sub: "modeled" },
  { tier: "LLM", sub: "RAG, Claude API, MLX" },
];

// Covers for the reel (V1.5). Labels describe the scene; the facts are in the panel text.
const COVERS: Record<string, { scene: "surplus-line" | "label-lens"; label: string }> = {
  "surplus-ai": { scene: "surplus-line", label: "Boxes and electronics ride a roller conveyor through four aluminium compute units and settle on a wooden pallet." },
  "label-lens": { scene: "label-lens", label: "A medicine bottle turns under a scan line; flagged words peel off its label and stack into a warning column." },
};

function StageLabel({ i }: { i: number }) {
  const st = STAGES[i];
  return (
    <p className={s.stage}>
      <span className={s.node} data-node aria-hidden />
      stage {st.n} / {st.id}
    </p>
  );
}

export function Pipeline({ facts }: { facts: LabFacts }) {
  const root = useRef<HTMLElement>(null);
  const heroProgress = useRef(0);

  useLabMotion(root, ({ isDesktop }) => {
    const el = root.current!;
    const q = gsap.utils.selector(el);
    // The tall sticky hero only makes sense when the live stream will run; otherwise the poster sits in a normal hero.
    el.dataset.three = render3DTier() === "off" ? "off" : "on";
    const packet = q("[data-packet]")[0] as HTMLElement;
    const packetLabel = q("[data-packet-label]")[0] as HTMLElement;

    // Hero: the name rises out of its mask; the particle stream's own intro runs in the scene. Under 1.2 s.
    gsap.timeline({ defaults: { ease: "power3.out" } }).from(q("[data-h-line]"), { yPercent: 110, duration: 0.8, stagger: 0.08 });

    // Scroll drives the stream: raw noise to lanes to glow to the LLM letters while the hero is pinned (sticky).
    ScrollTrigger.create({
      trigger: q("[data-hero]")[0],
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => (heroProgress.current = self.progress),
    });

    // The rail fills and the packet rides it, both scrubbed to the whole page's scroll.
    const whole = { trigger: el, start: "top top", end: "bottom bottom", scrub: true };
    gsap.fromTo(q("[data-fill]"), { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: whole });
    gsap.fromTo(packet, { y: 0 }, { y: () => (q("[data-rail]")[0] as HTMLElement).offsetHeight - 24, ease: "none", scrollTrigger: { ...whole, invalidateOnRefresh: true } });

    // Each stage lights its node when the reader reaches it and re-labels the packet.
    q("[data-stage]").forEach((sec) => {
      const node = sec.querySelector("[data-node]");
      const set = (state: string) => {
        packet.dataset.state = state;
        packetLabel.textContent = state;
      };
      const st = STAGES.find((x) => x.id === (sec as HTMLElement).dataset.stage)!;
      const prev = STAGES[Math.max(0, STAGES.indexOf(st) - 1)];
      ScrollTrigger.create({
        trigger: sec,
        start: "top 55%",
        onEnter: () => {
          node?.classList.add(s.lit);
          set(st.state);
        },
        onLeaveBack: () => {
          if (st.id !== "ingest") node?.classList.remove(s.lit);
          set(prev.state);
        },
      });
    });

    // Transform: vertical scroll drives the project reel sideways (desktop only; phones swipe).
    if (isDesktop) {
      const section = q("[data-reel]")[0] as HTMLElement;
      const track = q("[data-track]")[0] as HTMLElement;
      const distance = () => Math.max(0, track.scrollWidth - section.clientWidth);
      gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: { trigger: section, start: "top top", end: () => `+=${distance()}`, pin: true, scrub: 0.8, invalidateOnRefresh: true },
      });
    }

    // Serve: figures count up as they arrive.
    q("[data-count]").forEach((n) => countUp(n as HTMLElement));
  });

  return (
    <main ref={root} className={s.root}>
      <div className={s.rail} data-rail aria-hidden>
        <div className={s.track} />
        <div className={s.fill} data-fill />
        <div className={s.packet} data-packet data-state="raw">
          <span className={s.dot} />
          <span className={s.packetLabel} data-packet-label>
            raw
          </span>
        </div>
      </div>

      <div className={s.heroPin} data-hero>
        <section className={`${s.section} ${s.hero}`} data-stage="ingest" aria-labelledby="a-name">
          <div className={s.heroText}>
            <StageLabel i={0} />
            <h1 id="a-name" className={s.name}>
              {facts.name.split(" ").map((word) => (
                <span key={word} className={s.mask}>
                  <span data-h-line className={s.line}>
                    {word}
                  </span>
                </span>
              ))}
            </h1>
            <p className={s.headline}>{facts.headline}</p>
            <p className={s.now}>{facts.now}</p>
            <p className={s.links}>
              <a href={withBasePath("/resume.pdf")}>Resume</a>
              <a href={`mailto:${facts.email}`}>{facts.email}</a>
            </p>
          </div>
          <figure className={s.stream}>
            <SceneSlot
              scene="hero-stream"
              className={s.streamSlot}
              progress={heroProgress}
              priority
              portrait
              label="Medallion architecture as a particle stream: raw bronze particles fall and bounce, a field pulls them into silver lanes, and they glow gold and condense into the letters LLM."
            />
            <figcaption className={s.tiers}>
              {MEDALLION.map((m, i) => (
                <span key={m.tier} className={s[`tierLabel${i}`]}>
                  <b>{m.tier}</b> {m.sub}
                </span>
              ))}
            </figcaption>
          </figure>
          <p className={s.cue} aria-hidden>
            scroll to run the record through
          </p>
        </section>
      </div>

      <section className={s.reel} data-stage="transform" data-reel aria-labelledby="a-work">
        <div className={s.reelHead}>
          <StageLabel i={1} />
          <h2 id="a-work" className={s.h2}>
            What I build
          </h2>
        </div>
        <ol className={s.reelTrack} data-track tabIndex={0} aria-label="Featured projects (scrolls sideways)">
          {facts.featured.map((p, i) => (
            <li key={p.slug} className={s.panel}>
              {COVERS[p.slug] && <SceneSlot scene={COVERS[p.slug].scene} label={COVERS[p.slug].label} className={s.cover} />}
              {p.slug === "label-lens" && (
                <figure className={s.shot}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- static export; captured by scripts/capture-label-lens.mts */}
                  <img src={withBasePath("/images/projects/label-lens-app.webp")} width={1280} height={800} loading="lazy" decoding="async" alt="The live Label Lens app: a scan-a-label start page beside a phone showing a scanned snack-bar label flagged for peanuts." />
                  <figcaption>The live app</figcaption>
                </figure>
              )}
              <p className={s.job}>
                job {String(i + 1).padStart(2, "0")} / {p.status}
              </p>
              <h3 className={s.panelTitle}>{p.title}</h3>
              <p className={s.panelFigure}>{p.metric.value}</p>
              <p className={s.panelFigureLabel}>{p.metric.label}</p>
              <p className={s.panelLine}>{p.oneLiner}</p>
              <span className={s.open}>open case study</span>
            </li>
          ))}
        </ol>
      </section>

      <section className={s.section} data-stage="serve" aria-labelledby="a-proof">
        <StageLabel i={2} />
        <h2 id="a-proof" className={s.h2}>
          What it did
        </h2>
        <dl className={s.proof}>
          {facts.proof.map((m) => (
            <div key={m.summary} className={s.proofRow}>
              <dt className={s.proofValue}>
                <span data-count={m.value}>{m.value}</span>
              </dt>
              <dd>
                <span className={s.proofLabel}>{m.label}</span>
                <span className={s.proofSummary}>{m.summary}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={s.section} data-stage="query" aria-labelledby="a-query">
        <StageLabel i={3} />
        <h2 id="a-query" className={s.h2}>
          Ask about my work
        </h2>
        <div className={s.ask} role="presentation">
          <span className={s.prompt} aria-hidden>
            &gt;
          </span>
          <span className={s.askText}>What runs in production?</span>
          <span className={s.kbd}>⌘K</span>
        </div>
        <p className={s.links}>
          <a href={`mailto:${facts.email}`}>{facts.email}</a>
          <a href={facts.github}>GitHub</a>
          <a href={facts.linkedin}>LinkedIn</a>
          <a href={withBasePath("/resume.pdf")}>Resume</a>
        </p>
      </section>
      <StageHost />
    </main>
  );
}
