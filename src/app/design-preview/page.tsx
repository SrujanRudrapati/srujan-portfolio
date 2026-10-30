import type { Metadata } from "next";
import { Archivo, Hanken_Grotesk, IBM_Plex_Sans, Martian_Mono, Newsreader } from "next/font/google";
import type { ReactNode } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Reveal } from "@/components/Reveal";
import { Stat } from "@/components/Stat";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TagList, TextLink } from "@/components/ui";
import { otherProjects, profile } from "@/content/portfolio";
import s from "./preview.module.css";

// Not linked from the nav, not indexed. Two parts:
// 1. Living style guide for the chosen direction (Spec sheet), built from the
//    real primitives and tokens, pinned to light and dark side by side.
// 2. The Phase 1 comparison of all three directions, kept for reference.
// Fonts for part 2 are loaded only by this route.

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
const plexSans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-sans", display: "swap" });

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
    <div className={`${s.page} ${newsreader.variable} ${martian.variable} ${hanken.variable} ${archivo.variable} ${plexSans.variable}`}>
      <StyleGuide />

      <header className={s.intro}>
        <h1>Phase 1 comparison: three directions</h1>
        <p>
          Kept for reference. Each column is one direction, shown in light and dark. Same copy, same project, same
          diagram in every column, so only the design changes.
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

// Phase 2 style guide. Each primitive rendered with the real tokens, once per theme.

const tokenNames = ["bg", "surface", "raised", "line", "ink", "muted", "accent", "accent-2", "on-accent"] as const;
const tokenHex: Record<"light" | "dark", Record<(typeof tokenNames)[number], string>> = {
  light: { bg: "#F6F6F3", surface: "#EBEBE6", raised: "#FDFDFB", line: "#CFCFC8", ink: "#0A0A0A", muted: "#55554F", accent: "#C42A14", "accent-2": "#1B4FD8", "on-accent": "#FFFFFF" },
  dark: { bg: "#161616", surface: "#202020", raised: "#262626", line: "#3A3A36", ink: "#F2F2EE", muted: "#A3A39B", accent: "#FF6A4E", "accent-2": "#7F9CFF", "on-accent": "#0A0A0A" },
};
const tokenBg: Record<(typeof tokenNames)[number], string> = {
  bg: "bg-bg",
  surface: "bg-surface",
  raised: "bg-raised",
  line: "bg-line",
  ink: "bg-ink",
  muted: "bg-muted",
  accent: "bg-accent",
  "accent-2": "bg-accent-2",
  "on-accent": "bg-on-accent",
};

function StyleGuide() {
  return (
    <section className={s.guide} aria-labelledby="guide-heading">
      <header className={s.intro}>
        <h1 id="guide-heading">Spec sheet: living style guide</h1>
        <p>
          Every primitive in <code>src/components</code>, rendered with the real tokens from <code>globals.css</code>.
          The left panel is pinned to light and the right to dark; the toggle inside each panel switches the whole
          site, which is what the nav toggle does too.
        </p>
      </header>
      <div className={s.guideGrid}>
        <GuidePanel theme="light" />
        <GuidePanel theme="dark" />
      </div>
    </section>
  );
}

function GuidePanel({ theme }: { theme: "light" | "dark" }) {
  const sample = sampleProject;
  return (
    <div className={`${theme === "dark" ? "theme-dark" : "theme-light"} grid gap-10 bg-bg p-6 font-sans text-ink md:p-8`}>
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-medium text-muted">{theme} theme</p>
        <ThemeToggle />
      </div>

      <GuideBlock label="Type scale (Archivo, one family; width and weight carry hierarchy)">
        <div className="grid gap-3">
          <p className="font-display text-4xl leading-none font-bold tracking-tight font-stretch-expanded">Data layer</p>
          <p className="font-display text-3xl leading-none font-bold tracking-tight font-stretch-expanded">Featured work</p>
          <p className="font-display text-2xl leading-tight font-bold font-stretch-semi-expanded">Surplus AI</p>
          <p className="font-display text-xl leading-snug font-bold font-stretch-semi-expanded">F1 Race Outcome Predictor</p>
          <p className="max-w-measure text-base">{profile.subline} Body copy is full-strength ink, capped at 65ch.</p>
          <p className="text-sm text-muted">Small: captions, credits, tag text. Muted is for secondary copy only.</p>
          <p className="text-xs font-medium tabular-nums text-muted">Meta: March 2026 · GPA 3.96 / 4.0 · 10.0.0.1</p>
        </div>
      </GuideBlock>

      <GuideBlock label="Color tokens">
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5" aria-label={`${theme} tokens`}>
          {tokenNames.map((name) => (
            <li key={name} className="grid gap-1">
              <span aria-hidden="true" className={`block aspect-square border border-line ${tokenBg[name]}`} />
              <span className="text-xs text-muted">{name}</span>
              <span className="text-xs tabular-nums">{tokenHex[theme][name]}</span>
            </li>
          ))}
        </ul>
      </GuideBlock>

      <GuideBlock label="Buttons: primary, secondary, ghost, plus the small size">
        <div className="flex flex-wrap items-center gap-3">
          <Button href="#guide-heading">Download Resume</Button>
          <Button variant="secondary" href="#guide-heading">
            Resume
          </Button>
          <Button variant="ghost" href="#guide-heading">
            View all
          </Button>
          <Button size="sm" href="#guide-heading">
            Small
          </Button>
          <Button variant="secondary" size="sm" href="#guide-heading">
            Small
          </Button>
        </div>
      </GuideBlock>

      <GuideBlock label="Text link and tags">
        <div className="grid gap-4">
          <p>
            Inline links use cobalt:{" "}
            <TextLink href="#guide-heading">a text link</TextLink> inside a sentence.
          </p>
          <TagList items={sample.stack} label="Sample stack" />
          <TagList items={profile.proof} label="Hero proof chips" size="md" />
        </div>
      </GuideBlock>

      <GuideBlock label="Stat: medium and large">
        <div className="grid gap-4">
          <Stat value={sample.figure?.value ?? "80%"} label={sample.figure?.label ?? "top-3 accuracy"} />
          <Stat value="10M" label="records a day from 7+ source systems" size="lg" />
        </div>
      </GuideBlock>

      <GuideBlock label="Card: surface, heavy top rule, lift on hover">
        <Card as="article">
          <p className="text-xs font-medium tabular-nums text-muted">{sample.date}</p>
          <h3 className="mt-3 text-xl text-ink">{sample.title}</h3>
          <p className="mt-4 text-ink">{sample.outcome}</p>
          <div className="mt-6">
            <TagList items={sample.stack} label="Card stack" />
          </div>
        </Card>
      </GuideBlock>

      <GuideBlock label="Section header: 2px rule above, h2, optional intro">
        <div className="border-t-2 border-ink pt-8">
          <h2 className="text-3xl text-ink">Experience</h2>
          <p className="mt-4 max-w-measure text-lg text-muted">Three roles, most recent first.</p>
        </div>
      </GuideBlock>

      <GuideBlock label="Reveal: fades in on scroll; visible immediately without JS or with reduced motion">
        <Reveal>
          <div className="border-t-[3px] border-ink bg-surface p-4 text-sm">
            This block is wrapped in Reveal. Reload with the page scrolled above it, then scroll down.
          </div>
        </Reveal>
      </GuideBlock>
    </div>
  );
}

function GuideBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-3">
      <p className="text-xs font-medium text-muted">{label}</p>
      {children}
    </div>
  );
}
