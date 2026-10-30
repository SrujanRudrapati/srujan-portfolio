"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { withBasePath } from "@/lib/paths";
import type { LabFacts } from "../_lib/facts";
import { countUp, useLabMotion } from "../_lib/motion";
import s from "./notebook.module.css";

// Concept B: the site is a running data notebook. Cells execute as they scroll
// into view: the gutter goes In [ ] → In [*] → In [n], where n is the order the
// reader reached them, and the output renders under the code.

function Cell({ kind, code, children, label }: { kind: "code" | "md"; code?: string; children: ReactNode; label?: string }) {
  return (
    <div className={`${s.cell} ${kind === "md" ? s.md : s.code}`} data-cell={kind} aria-label={label}>
      {kind === "code" && (
        <>
          <span className={s.gutter} data-gutter aria-hidden>
            In [&nbsp;]:
          </span>
          <pre className={s.source}>
            <code>{code}</code>
          </pre>
          <span className={`${s.gutter} ${s.outGutter}`} aria-hidden>
            Out:
          </span>
          <div className={s.output} data-output>
            {children}
          </div>
        </>
      )}
      {kind === "md" && <div className={s.mdBody}>{children}</div>}
    </div>
  );
}

export function Notebook({ facts, location }: { facts: LabFacts; location: string }) {
  const root = useRef<HTMLElement>(null);
  const { surplus, labelLens } = facts;
  const lensTests = labelLens.tests.label.replace("tests: ", "");

  useLabMotion(root, ({ isDesktop }) => {
    const el = root.current!;
    const q = gsap.utils.selector(el);
    const kernel = q("[data-kernel]")[0] as HTMLElement;
    let count = 0;

    const execute = (cell: Element) => {
      const gutter = cell.querySelector<HTMLElement>("[data-gutter]");
      const output = cell.querySelector("[data-output]");
      if (!gutter || !output) return;
      gutter.textContent = "In [*]:";
      kernel.textContent = "busy";
      kernel.dataset.state = "busy";
      gsap.fromTo(output, { clipPath: "inset(0 0 100% 0)", opacity: 0.3 }, {
        clipPath: "inset(0 0 0% 0)",
        opacity: 1,
        duration: 0.6,
        delay: 0.35,
        ease: "power3.out",
        onStart: () => {
          count += 1;
          gutter.textContent = `In [${count}]:`;
        },
        onComplete: () => {
          kernel.textContent = "idle";
          kernel.dataset.state = "idle";
        },
      });
    };

    // Hero: the title cell renders, then the first code cell runs.
    gsap.from(q("[data-title-line]"), { yPercent: 105, duration: 0.8, stagger: 0.09, ease: "power3.out" });
    q("[data-cell=code]").forEach((cell) => {
      gsap.set(cell.querySelector("[data-output]"), { clipPath: "inset(0 0 100% 0)", opacity: 0.3 });
      ScrollTrigger.create({ trigger: cell, start: "top 80%", once: true, onEnter: () => execute(cell) });
    });

    // The scrubbed cell: per-item time shrinks from about 15 min to about 3 min as you scroll.
    const seq = q("[data-seq]")[0] as HTMLElement;
    const scrub = { trigger: seq, start: isDesktop ? "top top" : "top 70%", end: isDesktop ? "+=140%" : "bottom 60%", scrub: 0.6, pin: isDesktop };
    gsap.fromTo(q("[data-after-bar]"), { scaleX: 1 }, { scaleX: 0.2, ease: "none", scrollTrigger: scrub });
    gsap.fromTo(q("[data-after-label]"), { opacity: 0 }, { opacity: 1, ease: "none", scrollTrigger: { ...scrub, pin: false, start: isDesktop ? "top -100%" : "top 40%" } });
    q("[data-count]").forEach((n) => countUp(n as HTMLElement, { trigger: seq, scrub: true, start: isDesktop ? "top top" : "top 70%" }));
  });

  return (
    <main ref={root} className={s.root}>
      <header className={s.bar}>
        <span className={s.file}>srujan.ipynb</span>
        <span className={s.kernelWrap}>
          kernel <span className={s.kernel} data-kernel data-state="idle">idle</span>
        </span>
      </header>

      <section className={s.sheet} aria-labelledby="b-name">
        <Cell kind="md">
          <h1 id="b-name" className={s.title}>
            {facts.name.split(" ").map((w) => (
              <span key={w} className={s.mask}>
                <span data-title-line className={s.titleLine}>
                  {w}
                </span>
              </span>
            ))}
          </h1>
          <p className={s.lede}>{facts.headline}</p>
        </Cell>

        <Cell kind="code" code="whoami()">
          <table className={s.kv}>
            <tbody>
              <tr><th scope="row">does</th><td>{facts.subline}</td></tr>
              <tr><th scope="row">based_in</th><td>{location}</td></tr>
              <tr><th scope="row">now</th><td>{facts.now}</td></tr>
              <tr><th scope="row">email</th><td><a href={`mailto:${facts.email}`}>{facts.email}</a></td></tr>
              <tr><th scope="row">resume</th><td><a href={withBasePath("/resume.pdf")}>resume.pdf</a></td></tr>
            </tbody>
          </table>
        </Cell>
      </section>

      <section className={`${s.sheet} ${s.seq}`} data-seq aria-labelledby="b-surplus">
        <Cell kind="md">
          <h2 id="b-surplus" className={s.h2}>
            {surplus.project.title}
          </h2>
          <p className={s.prose}>{surplus.project.oneLiner}. {surplus.model.summary}</p>
        </Cell>
        <Cell kind="code" code={"surplus.minutes_per_item(before, after)"}>
          <figure className={s.chart}>
            <figcaption className={s.caption}>Minutes per item, approximate. {surplus.project.metric.summary}</figcaption>
            <div className={s.row}>
              <span className={s.rowLabel}>before</span>
              <span className={s.barWrap}><span className={`${s.bar} ${s.barBefore}`} /></span>
              <span className={s.rowValue}>about 15 min</span>
            </div>
            <div className={s.row}>
              <span className={s.rowLabel}>with Surplus AI</span>
              <span className={s.barWrap}><span className={`${s.bar} ${s.barAfter}`} data-after-bar /></span>
              <span className={s.rowValue} data-after-label>about 3 min</span>
            </div>
            <p className={s.result}>
              <span className={s.big} data-count={surplus.project.metric.value}>{surplus.project.metric.value}</span>
              <span className={s.bigLabel}>less processing time per item</span>
            </p>
          </figure>
        </Cell>
      </section>

      <section className={s.sheet} aria-labelledby="b-lens">
        <Cell kind="md">
          <h2 id="b-lens" className={s.h2}>
            {labelLens.project.title}
          </h2>
          <p className={s.prose}>{labelLens.project.oneLiner}</p>
        </Cell>
        <Cell kind="code" code={"label_lens.results()"}>
          <table className={s.results}>
            <thead>
              <tr><th scope="col">check</th><th scope="col">result</th></tr>
            </thead>
            <tbody>
              <tr><td>{labelLens.project.metric.label}</td><td className={s.num}>{labelLens.project.metric.value}</td></tr>
              <tr><td>response time, down from 16 s</td><td className={s.num}>{labelLens.latency.value}</td></tr>
              <tr><td>{lensTests}</td><td className={s.num}>{labelLens.tests.value}</td></tr>
            </tbody>
          </table>
          <p className={s.outNote}>
            <a href="https://label-lens-iota.vercel.app">label-lens-iota.vercel.app</a> · open case study
          </p>
        </Cell>
      </section>

      <section className={s.sheet} aria-labelledby="b-contact">
        <Cell kind="md">
          <h2 id="b-contact" className={s.h2}>
            Get in touch
          </h2>
        </Cell>
        <Cell kind="code" code="contact()">
          <ul className={s.contact}>
            <li><a href={`mailto:${facts.email}`}>{facts.email}</a></li>
            <li><a href={facts.github}>GitHub</a></li>
            <li><a href={facts.linkedin}>LinkedIn</a></li>
            <li><a href={withBasePath("/resume.pdf")}>Resume</a></li>
          </ul>
          <p className={s.outNote}>⌘K opens the kernel palette: jump to a page, ask about my work, switch theme.</p>
        </Cell>
      </section>
    </main>
  );
}
