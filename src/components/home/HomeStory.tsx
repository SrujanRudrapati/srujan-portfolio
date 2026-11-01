"use client";

import Link from "next/link";
import { useEffect, useRef, type FormEvent } from "react";
import { CountUp } from "@/components/motion/CountUp";
import { FULL, gsap, ScrollTrigger } from "@/components/motion/gsap";
import { HorizontalReel } from "@/components/motion/HorizontalReel";
import { Magnetic } from "@/components/motion/Magnetic";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { useScrubTimeline } from "@/components/motion/useScrubTimeline";
import { openPalette } from "@/components/site/routes";
import { render3DTier } from "@/components/three/capability";
import { SceneSlot } from "@/components/three/SceneSlot";
import type { HomeContent } from "@/data/home";
import { statusLabel } from "@/data/project-helpers";
import { withBasePath } from "@/lib/paths";
import s from "./home.module.css";

// The home page as the Pipeline (runbook V4, design-direction): one record travels a rail
// down the page through four stages, changing state at each (bronze raw, silver cleaned,
// gold modeled, blue answer). Each screen has one job: who (ingest), what he builds and
// the four featured projects (transform), proof (serve), ask and contact (query).
// Everything here is a teaser; depth lives on /work, /about and /cv. Tuned after the V4
// recruiter review: the strongest figure is in the hero, phones get a short stream strip so
// the work reel starts on screen 2, and the footer is the one contact block.

const STAGES = [
  { id: "ingest", n: "01", state: "raw" },
  { id: "transform", n: "02", state: "cleaned" },
  { id: "serve", n: "03", state: "modeled" },
  { id: "query", n: "04", state: "answer" },
] as const;

const TIERS = [
  { tier: "bronze", sub: "raw" },
  { tier: "silver", sub: "cleaned" },
  { tier: "gold", sub: "modeled" },
  { tier: "LLM", sub: "RAG, Claude API, MLX" },
];

function Stage({ i }: { i: number }) {
  const st = STAGES[i];
  return (
    <p className={s.stage}>
      <span className={s.node} data-node aria-hidden />
      stage {st.n} / {st.id}
    </p>
  );
}

export function HomeStory({ content }: { content: HomeContent }) {
  const { profile, statements, featured, proof, projectCount, lead } = content;
  const root = useRef<HTMLElement>(null);
  const heroProgress = useRef(0);

  // The rail fills and the record rides it, scrubbed to the whole page.
  useScrubTimeline(
    root,
    (tl, q) => {
      const rail = q("[data-rail]")[0] as HTMLElement;
      tl.fromTo(q("[data-fill]"), { scaleY: 0 }, { scaleY: 1 }, 0).fromTo(q("[data-record]"), { y: 0 }, { y: () => rail.offsetHeight - 24 }, 0);
    },
    { start: "top top", end: "bottom bottom", scrub: true },
  );

  // Stage changes (the record's state and colour, each node lighting), the hero's scroll
  // progress for the particle stream, and the tall sticky hero only when 3D will run.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    el.dataset.three = render3DTier() === "off" ? "off" : "on";
    const mm = gsap.matchMedia(el);
    mm.add(FULL, () => {
      el.dataset.motion = "on";
      const record = el.querySelector<HTMLElement>("[data-record]")!;
      const label = el.querySelector<HTMLElement>("[data-record-label]")!;
      const set = (state: string) => {
        record.dataset.state = state;
        label.textContent = state;
      };
      el.querySelectorAll<HTMLElement>("[data-stage]").forEach((sec) => {
        const st = STAGES.find((x) => x.id === sec.dataset.stage)!;
        const prev = STAGES[Math.max(0, STAGES.indexOf(st) - 1)];
        const node = sec.querySelector("[data-node]");
        ScrollTrigger.create({
          trigger: sec,
          start: "top 55%",
          onEnter: () => {
            node?.setAttribute("data-lit", "");
            set(st.state);
          },
          onLeaveBack: () => {
            if (st.id !== "ingest") node?.removeAttribute("data-lit");
            set(prev.state);
          },
        });
      });
      ScrollTrigger.create({ trigger: el.querySelector("[data-hero]"), start: "top top", end: "bottom bottom", onUpdate: (self) => (heroProgress.current = self.progress) });
      return () => {
        delete el.dataset.motion;
        set(STAGES[0].state);
      };
    });
    // data-three and data-motion make the hero 180dvh tall, after the reel (a child, so its
    // layout effect ran first) measured where its pin starts. Re-measure, or the reel pins
    // about 80dvh early and its 3D covers draw over the heading above it.
    ScrollTrigger.refresh();
    return () => mm.revert();
  }, []);

  const ask = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q");
    openPalette({ query: typeof q === "string" ? q.trim() : "", ask: true });
  };

  return (
    <main id="main" ref={root} className={s.root}>
      <div className={s.rail} data-rail aria-hidden>
        <div className={s.track} />
        <div className={s.fill} data-fill />
        <div className={s.record} data-record data-state="raw">
          <span className={s.dot} />
          <span className={s.recordLabel} data-record-label>
            raw
          </span>
        </div>
      </div>

      {/* 01 ingest: who, what, where now, proof, and the way in. */}
      <div className={s.heroPin} data-hero>
        <section className={`${s.section} ${s.hero}`} data-stage="ingest" aria-labelledby="home-name">
          <div className={s.heroText}>
            <Stage i={0} />
            <h1 id="home-name" className={s.name}>
              {profile.name}
            </h1>
            <p className={s.headline}>{profile.headline}</p>
            <p className={s.subline}>{profile.subline}</p>
            <p className={s.now}>{profile.now}</p>
            <p className={s.lead}>
              <span className={s.leadValue}>{lead.value}</span>
              <span className={s.leadLabel}>
                {lead.label}. {lead.where}.
              </span>
            </p>
            {/* The way in sits above the chips so the email is on a phone's first screen (recruiter review, V4). */}
            <div className={s.actions}>
              <Magnetic>
                <Link href="/work" className={s.primary}>
                  See my work
                </Link>
              </Magnetic>
              <a href={withBasePath(profile.resume)} target="_blank" rel="noopener noreferrer" className={s.secondary}>
                Resume
              </a>
              <a href={`mailto:${profile.email}`} className={s.textLink}>
                {profile.email}
              </a>
            </div>
            <ul className={s.proofChips} aria-label="Highlights">
              {profile.proof.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
          <figure className={s.stream}>
            <SceneSlot
              scene="hero-stream"
              className={s.streamSlot}
              progress={heroProgress}
              priority
              label="Medallion architecture as a particle stream: raw bronze particles fall and bounce, a field pulls them into silver lanes, and they glow gold and condense into the letters LLM."
            />
            <figcaption className={s.tiers}>
              {TIERS.map((m, i) => (
                <span key={m.tier} className={s[`tier${i}`]}>
                  <b>{m.tier}</b> {m.sub}
                </span>
              ))}
            </figcaption>
          </figure>
          <p className={s.cue} aria-hidden>
            Scroll
          </p>
        </section>
      </div>

      {/* 02 transform: what he builds, then the four featured projects. */}
      <section className={s.section} data-stage="transform" aria-labelledby="home-what">
        <Stage i={1} />
        <h2 id="home-what" className={s.h2}>
          What I build
        </h2>
        <ul className={s.statements}>
          {statements.map((st) => (
            <li key={st.href}>
              <SplitReveal as="p" by="lines" className={s.statement}>
                {st.text}
              </SplitReveal>
              <Link href={st.href} className={s.more}>
                See the proof<span className="sr-only">: {st.proofFor}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={s.reelSection} aria-labelledby="home-work">
        <div className={s.reelHead}>
          <h2 id="home-work" className={s.h2}>
            Selected work
          </h2>
        </div>
        <p className={s.reelHint} aria-hidden>
          <span className={s.hintTouch}>
            {featured.length} of {projectCount} projects, swipe sideways
          </span>
          <span className={s.hintWheel}>
            {featured.length} of {projectCount} projects, keep scrolling to move sideways
          </span>
        </p>
        <HorizontalReel label="Selected work (scrolls sideways)" className={s.reel} clip={false}>
          {featured.map((p, i) => (
            <li key={p.slug} className={s.panel}>
              <SceneSlot scene={p.cover.scene} label={p.cover.label} className={s.cover} />
              <p className={s.job}>
                {i + 1} of {featured.length} / {statusLabel[p.status as keyof typeof statusLabel].toLowerCase()}
              </p>
              <h3 className={s.panelTitle}>{p.title}</h3>
              <p className={s.figure}>
                <CountUp value={p.metric.value} sideways />
              </p>
              <p className={s.figureLabel}>{p.metric.label}</p>
              <p className={s.oneLiner}>{p.oneLiner}</p>
              <Link href={`/work/${p.slug}`} className={s.open} data-cursor="open">
                Open case study<span className="sr-only">: {p.title}</span>
              </Link>
            </li>
          ))}
        </HorizontalReel>
        <p className={s.allWork}>
          <Link href="/work" className={s.more}>
            All {projectCount} projects
          </Link>
        </p>
      </section>

      {/* 03 serve: the figures, counting up as they arrive. */}
      <section className={s.section} data-stage="serve" aria-labelledby="home-proof">
        <Stage i={2} />
        <h2 id="home-proof" className={s.h2}>
          What it did
        </h2>
        <dl className={s.proof}>
          {proof.map((m) => (
            <div key={m.summary} className={s.proofRow}>
              <dt className={s.proofValue}>
                <CountUp value={m.value} />
              </dt>
              <dd>
                <span className={s.proofLabel}>
                  <span className={s.proofSource}>{m.source}:</span> {m.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 04 query: ask about the work, or get in touch. */}
      <section id="contact" className={s.section} data-stage="query" aria-labelledby="home-ask">
        <Stage i={3} />
        <h2 id="home-ask" className={s.h2}>
          Ask about my work
        </h2>
        <form role="search" aria-label="Ask about my work" className={s.ask} onSubmit={ask}>
          <span aria-hidden className={s.prompt}>
            &gt;
          </span>
          <label htmlFor="home-ask-input" className="sr-only">
            Your question
          </label>
          <input id="home-ask-input" name="q" maxLength={300} placeholder="What runs in production?" className={s.askInput} autoComplete="off" />
          <button type="submit" className={s.askButton}>
            Ask
          </button>
        </form>
        <p className={s.contactNote}>
          Or write to <a href={`mailto:${profile.email}`}>{profile.email}</a>. GitHub, LinkedIn and the resume are just below.
        </p>
      </section>
    </main>
  );
}
