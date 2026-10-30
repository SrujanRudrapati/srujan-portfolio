import type { Metadata } from "next";
import { Archivo, Hanken_Grotesk, Martian_Mono, Newsreader } from "next/font/google";
import type { ReactNode } from "react";
import { otherProjects, profile } from "@/content/portfolio";
import s from "./preview.module.css";

// Throwaway Phase 1 page. Three visual directions, each in light and dark,
// rendered side by side. Not linked from the nav, not indexed.
// Fonts here are loaded only by this route; the live site is untouched.

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-newsreader",
  display: "swap",
});
const martian = Martian_Mono({ subsets: ["latin"], variable: "--font-martian", display: "swap" });
const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap" });
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });

export const metadata: Metadata = {
  title: "Design preview",
  robots: { index: false, follow: false },
};

type Palette = { bg: string; surface: string; text: string; muted: string; accent: string; accent2: string };

type Direction = {
  key: "a" | "b" | "c";
  name: string;
  feel: string;
  fonts: string;
  accentUse: string;
  light: Palette;
  dark: Palette;
  Diagram: () => ReactNode;
};

const sampleProject = otherProjects.find((p) => p.title.startsWith("F1")) ?? otherProjects[0];

const directions: Direction[] = [
  {
    key: "a",
    name: "Lab notebook",
    feel: "A careful engineer's ledger: warm paper, ink, and nothing that was not written down for a reason.",
    fonts: "Newsreader 500 for display, IBM Plex Sans 400/500 for body and numbers",
    accentUse: "Ink blue for links and diagram flow. Red pencil for impact numbers and status marks.",
    light: { bg: "#F2EDE3", surface: "#E9E2D3", text: "#1C1A16", muted: "#5B5648", accent: "#24419A", accent2: "#B2442A" },
    dark: { bg: "#1C1915", surface: "#262219", text: "#EEE7D9", muted: "#A89F8E", accent: "#9DB1F0", accent2: "#E58B6A" },
    Diagram: MedallionLedger,
  },
  {
    key: "b",
    name: "Night shift",
    feel: "A control room at 2 a.m.: dark petrol, one hot signal, and every stage reporting its state.",
    fonts: "Martian Mono 500/600 for display, labels and numbers, Hanken Grotesk 400/500 for body",
    accentUse: "Orange for links, impact numbers and the active stage. Mint only for healthy status dots.",
    light: { bg: "#F3F6F6", surface: "#E6ECEC", text: "#101C20", muted: "#4C5E64", accent: "#B03A04", accent2: "#1D7A5C" },
    dark: { bg: "#0F1C21", surface: "#16272E", text: "#E6EEF0", muted: "#8FA6AE", accent: "#FF8A3D", accent2: "#5FD3A6" },
    Diagram: MedallionRun,
  },
  {
    key: "c",
    name: "Spec sheet",
    feel: "A datasheet for a person: bright, exact, strong type on a visible grid, no decoration at all.",
    fonts: "Archivo only. Expanded width 700 for headlines and figures, normal width 400/500 for body",
    accentUse: "Red for impact numbers and the primary action. Cobalt for links and diagram flow.",
    light: { bg: "#F6F6F3", surface: "#EBEBE6", text: "#0A0A0A", muted: "#55554F", accent: "#C42A14", accent2: "#1B4FD8" },
    dark: { bg: "#161616", surface: "#202020", text: "#F2F2EE", muted: "#A3A39B", accent: "#FF6A4E", accent2: "#7F9CFF" },
    Diagram: MedallionStrip,
  },
];

export default function DesignPreview() {
  return (
    <div className={`${s.page} ${newsreader.variable} ${martian.variable} ${hanken.variable} ${archivo.variable}`}>
      <header className={s.intro}>
        <h1>Design preview: three directions</h1>
        <p>
          Phase 1 throwaway page. Each column is one direction, shown in light and dark. Same copy, same project,
          same diagram in every column, so only the design changes. Not linked from the site.
        </p>
      </header>

      <div className={s.grid}>
        {directions.map((d) => (
          <section key={d.key} className={`${s.col} ${s[d.key]}`} aria-labelledby={`dir-${d.key}`}>
            <Panel dir={d} mode="light" headingId={`dir-${d.key}`} />
            <Panel dir={d} mode="dark" />
          </section>
        ))}
      </div>
    </div>
  );
}

function Panel({ dir, mode, headingId }: { dir: Direction; mode: "light" | "dark"; headingId?: string }) {
  const p = dir[mode];
  const vars = {
    "--pb": p.bg,
    "--ps": p.surface,
    "--pt": p.text,
    "--pm": p.muted,
    "--pa": p.accent,
    "--p2": p.accent2,
  } as React.CSSProperties;

  return (
    <article className={`${s.panel} ${s[mode]}`} style={vars}>
      <div className={s.panelHead}>
        {headingId ? (
          <h2 id={headingId} className={s.name}>
            {dir.name}
          </h2>
        ) : (
          <p className={s.name}>{dir.name}</p>
        )}
        <span className={s.mode}>{mode}</span>
      </div>
      <p className={s.feel}>{dir.feel}</p>

      <Swatches palette={p} />

      <div className={s.type}>
        <p className={s.headline}>{profile.headline}</p>
        <p className={s.body}>{profile.subline}</p>
        <p className={s.fontNote}>{dir.fonts}</p>
      </div>

      <ProjectCard />

      <div className={s.diagram}>
        <dir.Diagram />
        <p className={s.caption}>{dir.accentUse}</p>
      </div>
    </article>
  );
}

function Swatches({ palette }: { palette: Palette }) {
  const entries: [string, string][] = [
    ["bg", palette.bg],
    ["surface", palette.surface],
    ["text", palette.text],
    ["muted", palette.muted],
    ["accent", palette.accent],
    ["accent 2", palette.accent2],
  ];
  return (
    <ul className={s.swatches} aria-label="Palette">
      {entries.map(([label, hex]) => (
        <li key={label}>
          <span className={s.swatch} style={{ background: hex }} aria-hidden="true" />
          <span className={s.swatchLabel}>{label}</span>
          <span className={s.swatchHex}>{hex}</span>
        </li>
      ))}
    </ul>
  );
}

function ProjectCard() {
  const p = sampleProject;
  return (
    <article className={s.card} aria-label={`Sample card: ${p.title}`}>
      <p className={s.cardMeta}>{p.date}</p>
      <h3 className={s.cardTitle}>{p.title}</h3>
      {p.figure && (
        <p className={s.stat}>
          <span className={s.statValue}>{p.figure.value}</span>
          <span className={s.statLabel}>{p.figure.label}</span>
        </p>
      )}
      <p className={s.cardBody}>{p.outcome}</p>
      <div className={s.cardFoot}>
        <ul className={s.tags} aria-label="Stack">
          {p.stack.map((t) => (
            <li key={t} className={s.tag}>
              {t}
            </li>
          ))}
        </ul>
        <a href={profile.github} className={s.link}>
          View repo
        </a>
      </div>
    </article>
  );
}

// Shared stage data for the three medallion diagrams.
const stages = [
  { name: "Source", sub: "systems", tone: "none" },
  { name: "Bronze", sub: "raw", tone: "bronze" },
  { name: "Silver", sub: "cleaned", tone: "silver" },
  { name: "Gold", sub: "modeled", tone: "gold" },
  { name: "LLM", sub: "agents", tone: "llm" },
] as const;

function MedallionLedger() {
  return (
    <ol className={s.ledger} aria-label="Medallion pipeline, ledger style">
      {stages.map((st, i) => (
        <li key={st.name} className={s.ledgerItem} data-tone={st.tone}>
          {i > 0 && <span className={s.ledgerRule} aria-hidden="true" />}
          <span className={s.ledgerCell}>
            <span className={s.ledgerStamp} aria-hidden="true" />
            <span className={s.ledgerName}>{st.name}</span>
            <span className={s.ledgerSub}>{st.sub}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

function MedallionRun() {
  return (
    <ol className={s.run} aria-label="Medallion pipeline, pipeline run style">
      {stages.map((st, i) => (
        <li key={st.name} className={s.runItem} data-tone={st.tone}>
          {i > 0 && <span className={s.runConn} aria-hidden="true" style={{ "--i": i } as React.CSSProperties} />}
          <span className={s.runNode}>
            <span className={s.runName}>{st.name.toLowerCase()}</span>
            <span className={s.runSub}>{st.sub}</span>
            <span className={s.runStatus}>
              <span className={s.runDot} aria-hidden="true" />
              {st.tone === "llm" ? "running" : "ok"}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}

function MedallionStrip() {
  return (
    <ol className={s.strip} aria-label="Medallion pipeline, strip style">
      {stages.map((st) => (
        <li key={st.name} className={s.stripTile} data-tone={st.tone}>
          <span className={s.stripName}>{st.name}</span>
          <span className={s.stripSub}>{st.sub}</span>
        </li>
      ))}
    </ol>
  );
}
