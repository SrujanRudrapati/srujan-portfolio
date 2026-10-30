"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { LabFacts } from "../_lib/facts";
import { countUp, useLabMotion } from "../_lib/motion";
import { withBasePath } from "@/lib/paths";
import s from "./pipeline.module.css";

// Concept A: the site is a data pipeline and scrolling runs a record through it.
// One rail runs down the page; a packet rides it, scrubbed to scroll position,
// and changes state at each stage (bronze raw, silver cleaned, gold modeled, answer).

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

  useLabMotion(root, ({ isDesktop }) => {
    const el = root.current!;
    const q = gsap.utils.selector(el);
    const packet = q("[data-packet]")[0] as HTMLElement;
    const packetLabel = q("[data-packet-label]")[0] as HTMLElement;

    // Hero: the name rises out of its mask while the medallion builds left to right. Under 1.2 s.
    gsap
      .timeline({ defaults: { ease: "power3.out" } })
      .from(q("[data-h-line]"), { yPercent: 110, duration: 0.8, stagger: 0.08 })
      .from(q("[data-m-node]"), { opacity: 0, scale: 0.6, transformOrigin: "50% 50%", duration: 0.45, stagger: 0.16 }, 0.2)
      .from(q("[data-m-edge]"), { strokeDashoffset: 1, duration: 0.3, stagger: 0.16, ease: "none" }, 0.4);

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

      <section className={`${s.section} ${s.hero}`} data-stage="ingest" aria-labelledby="a-name">
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
        <figure className={s.medallion}>
          <svg viewBox="0 0 880 128" role="img" aria-labelledby="a-med-t a-med-d">
            <title id="a-med-t">Medallion architecture</title>
            <desc id="a-med-d">Data moves from bronze (raw) to silver (cleaned) to gold (modeled), then to an LLM layer built on RAG, the Claude API and MLX.</desc>
            {MEDALLION.slice(0, -1).map((_, i) => (
              <line key={i} data-m-edge x1={i * 240 + 168} y1={40} x2={i * 240 + 240} y2={40} pathLength={1} strokeDasharray={1} className={s.edge} />
            ))}
            {MEDALLION.map((m, i) => (
              <g key={m.tier} data-m-node className={s[`tier${i}`]}>
                <rect x={i * 240} y={8} width={168} height={64} className={s.tile} />
                <text x={i * 240 + 16} y={48} className={s.tierText}>
                  {m.tier}
                </text>
                <text x={i * 240} y={100} className={s.subText}>
                  {m.sub}
                </text>
              </g>
            ))}
          </svg>
        </figure>
        <p className={s.links}>
          <a href={withBasePath("/resume.pdf")}>Resume</a>
          <a href={`mailto:${facts.email}`}>{facts.email}</a>
        </p>
        <p className={s.cue} aria-hidden>
          scroll to run the record through
        </p>
      </section>

      <section className={s.reel} data-stage="transform" data-reel aria-labelledby="a-work">
        <div className={s.reelHead}>
          <StageLabel i={1} />
          <h2 id="a-work" className={s.h2}>
            What I build
          </h2>
        </div>
        <ol className={s.reelTrack} data-track>
          {facts.featured.map((p, i) => (
            <li key={p.slug} className={s.panel}>
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
    </main>
  );
}
