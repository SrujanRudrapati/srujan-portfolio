"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { withBasePath } from "@/lib/paths";
import type { LabFacts } from "../_lib/facts";
import { countUp, useLabMotion } from "../_lib/motion";
import s from "./spec.module.css";

gsap.registerPlugin(SplitText);

// Concept C: an engineering datasheet for a person. Oversized condensed type,
// hairline rules that draw as you scroll, figure numbers, and the impact
// figures themselves as the only imagery.

export function SpecSheet({ facts, about, location }: { facts: LabFacts; about: string[]; location: string }) {
  const root = useRef<HTMLElement>(null);
  const { surplus, devhacks } = facts;

  useLabMotion(root, ({ isDesktop }) => {
    const el = root.current!;
    const q = gsap.utils.selector(el);

    // Hero: the name rises line by line out of a mask; the spec rules draw after it.
    const name = SplitText.create(q("[data-split]"), { type: "lines", mask: "lines", aria: "auto" });
    gsap
      .timeline({ defaults: { ease: "power3.out" } })
      .from(name.lines, { yPercent: 105, duration: 0.85, stagger: 0.1 })
      .from(q("[data-hero-rule]"), { scaleX: 0, transformOrigin: "left", duration: 0.6, stagger: 0.06 }, 0.35)
      .from(q("[data-hero-row]"), { opacity: 0, duration: 0.4, stagger: 0.06 }, 0.5);

    // Every other rule draws as it enters.
    q("[data-rule]").forEach((r) => gsap.from(r, { scaleX: 0, transformOrigin: "left", duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: r, start: "top 88%", once: true } }));

    // The about paragraph lights up word by word as you read it.
    const words = SplitText.create(q("[data-read]"), { type: "words", aria: "auto" });
    gsap.fromTo(words.words, { opacity: 0.18 }, { opacity: 1, stagger: 0.04, ease: "none", scrollTrigger: { trigger: q("[data-read]")[0], start: "top 75%", end: "bottom 45%", scrub: true } });

    // fig. 01: minutes per item fall from about 15 to about 3, scrubbed; pinned on desktop.
    const fig = q("[data-fig1]")[0] as HTMLElement;
    const minutes = q("[data-minutes]")[0] as HTMLElement;
    const state = { v: 15 };
    const scrub = isDesktop
      ? { trigger: fig, start: "top top", end: "+=120%", scrub: 0.6, pin: true }
      : { trigger: fig, start: "top 70%", end: "bottom 50%", scrub: 0.6 };
    gsap
      .timeline({ scrollTrigger: scrub })
      .fromTo(state, { v: 15 }, { v: 3, ease: "none", onUpdate: () => (minutes.textContent = String(Math.round(state.v))) }, 0)
      .fromTo(q("[data-marker]"), { xPercent: 0 }, { xPercent: -80, ease: "none" }, 0)
      .fromTo(q("[data-fig1-result]"), { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.25 }, 0.75);

    q("[data-count]").forEach((n) => countUp(n as HTMLElement));
  });

  const figures = [facts.records, surplus.pallet, devhacks.submissions, facts.labelLens.project.metric, devhacks.receipts];

  return (
    <main ref={root} className={s.root}>
      <header className={s.top}>
        <span>{facts.name}</span>
        <span>Data engineer, {location}</span>
        <span className={s.topRight}>Datasheet</span>
      </header>

      <section className={s.hero} aria-labelledby="c-name">
        <h1 id="c-name" className={s.name} data-split>
          {facts.name}
        </h1>
        <dl className={s.spec}>
          {[
            ["Function", facts.headline],
            ["Profile", facts.subline],
            ["Status", facts.now],
          ].map(([k, v]) => (
            <div key={k} className={s.specRow} data-hero-row>
              <span className={s.rule} data-hero-rule aria-hidden />
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
          <div className={s.specRow} data-hero-row>
            <span className={s.rule} data-hero-rule aria-hidden />
            <dt>Contact</dt>
            <dd>
              <a href={`mailto:${facts.email}`}>{facts.email}</a>, <a href={withBasePath("/resume.pdf")}>resume</a>
            </dd>
          </div>
        </dl>
      </section>

      <section className={s.section} aria-label="About">
        <span className={s.rule} data-rule aria-hidden />
        <p className={s.read} data-read>
          {about.join(" ")}
        </p>
      </section>

      <section className={s.fig} data-fig1 aria-labelledby="c-fig1">
        <span className={s.rule} data-rule aria-hidden />
        <p className={s.figNo}>fig. 01</p>
        <h2 id="c-fig1" className={s.figTitle}>
          Minutes to process one item at ASU Surplus, before and after {surplus.project.title}
        </h2>
        <p className={s.minutes} aria-label="from about 15 minutes to about 3 minutes">
          <span className={s.about}>about</span>
          <span data-minutes>3</span>
          <span className={s.unit}>min</span>
        </p>
        <div className={s.scale} aria-hidden>
          <span className={s.scaleLine} />
          {Array.from({ length: 16 }, (_, i) => (
            <span key={i} className={s.tick} style={{ left: `${(i / 15) * 100}%` }}>
              {i % 5 === 0 || i === 3 ? <span className={s.tickLabel}>{i}</span> : null}
            </span>
          ))}
          <span className={s.markerTrack} data-marker>
            <span className={s.marker} />
          </span>
        </div>
        <p className={s.figResult} data-fig1-result>
          <span className={s.resultValue}>{surplus.project.metric.value}</span> {surplus.project.metric.label}.
        </p>
      </section>

      <section className={s.section} aria-labelledby="c-fig2">
        <span className={s.rule} data-rule aria-hidden />
        <p className={s.figNo}>fig. 02</p>
        <h2 id="c-fig2" className={s.figTitle}>
          Selected figures
        </h2>
        <dl className={s.figures}>
          {figures.map((m) => (
            <div key={m.summary} className={s.figure}>
              <dt className={s.figValue}>
                <span data-count={m.value}>{m.value}</span>
              </dt>
              <dd className={s.figLabel}>{m.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={s.section} aria-labelledby="c-fig3">
        <span className={s.rule} data-rule aria-hidden />
        <p className={s.figNo}>fig. 03</p>
        <div className={s.project}>
          <div>
            <h2 id="c-fig3" className={s.projectTitle}>
              {devhacks.project.title}
            </h2>
            <p className={s.projectLine}>{devhacks.project.oneLiner}</p>
          </div>
          <p className={s.place}>{devhacks.project.metric.value}</p>
        </div>
        <table className={s.table}>
          <tbody>
            <tr><th scope="row">Result</th><td>{devhacks.project.metric.value} {devhacks.project.metric.label}</td></tr>
            <tr><th scope="row">Field</th><td>{devhacks.submissions.value} {devhacks.submissions.label}</td></tr>
            <tr><th scope="row">Date</th><td>{devhacks.project.date}</td></tr>
            {devhacks.project.highlights.map((h) => {
              const [entry, ...rest] = h.split(": ");
              return (
                <tr key={entry}><th scope="row">{entry}</th><td>{rest.join(": ")}</td></tr>
              );
            })}
          </tbody>
        </table>
        <p className={s.links}>
          <a href="https://github.com/SrujanRudrapati/cooked">Cooked repository</a>
          <a href="https://github.com/SrujanRudrapati/receipts">Receipts repository</a>
          <span>open case study</span>
        </p>
      </section>

      <footer className={s.section}>
        <span className={s.rule} data-rule aria-hidden />
        <p className={s.links}>
          <a href={`mailto:${facts.email}`}>{facts.email}</a>
          <a href={facts.github}>GitHub</a>
          <a href={facts.linkedin}>LinkedIn</a>
          <a href={withBasePath("/resume.pdf")}>Resume</a>
        </p>
      </footer>
    </main>
  );
}
