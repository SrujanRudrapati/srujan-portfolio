---
name: design-direction
description: The chosen visual direction for the portfolio redesign. v3 ("Pipeline" structure, Spec-sheet typography, one blue accent, realistic 3D layer) supersedes v2 ("Spec sheet") from Phase V2 on. Covers palette hex values for light and dark, Archivo and Martian Mono type rules, 3D material language, spacing scale, radii, motion rules, status vocabulary, and the explicit avoid list. Load whenever creating or styling any component, page, section, card, SVG, diagram, animation, or Tailwind class on the portfolio site, and whenever tokens in globals.css change (then update this file too).
---

# v3 direction: the Pipeline, set in Spec-sheet type (G4, 2026-10-30)

Srujan's pick (DECISIONS 11): "A's structure with C's typography, blue accent." One concept only; `/lab/b` and `/lab/c` are removed at the start of V2. Everything from V2 on follows this section; the v2 "Spec sheet" section below describes the live site until V4 to V6 replace it and stays as history.

**Structure (from A).** The site is a data pipeline and scrolling runs one record through it. Home stages: `stage 01 / ingest` (who), `stage 02 / transform` (what he builds, pinned reel of featured projects), `stage 03 / serve` (proof, figures count up), `stage 04 / query` (Ask and contact). One thin rail runs down the page as the data path; the record rides it, scrubbed to scroll, changing state bronze `raw` → silver `cleaned` → gold `modeled` → accent `answer`. Case studies continue the rail: `input` (problem), `transform` (approach, diagram drawn by scroll), `output` (figures).

**Palette (C's neutrals, one blue accent; C's red is dropped).**

| Role | Light | Dark |
|---|---|---|
| Page | `#FFFFFF` | `#000000` |
| Ink (all text, rules) | `#000000` | `#FFFFFF` |
| Muted (meta, captions only) | `#5C5C5C` | `#A3A3A3` |
| Hairline | `#D9D9D9` | `#2B2B2B` |
| Surface (cards, code, the palette list) | `#F2F2F2` | `#141414` |
| Raised (dialogs, inputs) | `#FFFFFF` | `#1C1C1C` |
| Accent (data path, record, figures, links, focus) | `#1D4ED8` | `#7C9BFF` |
| Bronze / silver / gold (medallion states, 3D data stages only) | `#9A5F35` / `#7C838B` / `#9C7A1C` | `#D08B57` / `#B5BCC3` / `#E0B84A` |

Two neutrals plus one accent. Live in `src/app/globals.css` since V3, under the v2 token names (`--accent` and `--accent-2` are both the blue); AA ratios in `docs/v3/IA.md`. The medallion tints are data states, never decoration: they appear only on the record, the hero particle stream, the medallion and the mini-game. No second accent hue, no gradients in the DOM.

**Type (from C).** Archivo on its width axis: display (name, impact figures) 800 at 62% width, letter-spacing -0.03em, the name up to full width; section titles 600 to 800 at 112%; body 400, labels 500. Martian Mono 400 only for stage labels (`stage 02 / transform`), figure numbers (`fig. 01`), the record's state and table keys. Sentence case; mono labels lowercase.

**3D material language (V1.5).** Scenes are real objects under studio light, not glowing sci-fi: PBR wood, cardboard, brushed aluminium, glass, plastic and paper with CC0 textures; one CC0 studio HDRI for image-based light; AgX tone mapping; soft contact shadows on a neutral floor that matches the page colour (white or black); AO always, depth of field subtle, bloom only on the gold/LLM glow. The accent blue appears in 3D only as the data path (scan line, pulses, lanes). No brand logos, liveries or trademarks on any model. Posters (static renders) carry the same framing as the live scene so the swap is invisible.

**Carried over from v2.** Square corners, rules instead of shadows, left-aligned asymmetric grid, focus ring in the accent, the avoid list below (minus "a monospace face for data labels": v3 allows Martian Mono for labels only).

---

# v2 design direction: Spec sheet (live until V4 to V6, then history)

Chosen in Phase 1, built in Phase 2 (`docs/REDESIGN_NOTES.md`). Feel: a datasheet for a person. Bright, exact, strong type on a visible grid, no decoration. Colour appears only where it means something. The diagrams are the hero; everything else stays quiet so they read.

Source of truth for values: `src/app/globals.css`. Use the Tailwind utility names below; never hard-code a hex in a component. Light is the default; dark via `data-theme="dark"` on `<html>` or system preference with nothing stored.

## Palette

| Token | Utility | Light | Dark | Role |
|---|---|---|---|---|
| `--bg` | `bg-bg` | `#F6F6F3` | `#161616` | Page |
| `--surface` | `bg-surface` | `#EBEBE6` | `#202020` | Cards, diagram panels |
| `--surface-raised` | `bg-raised` | `#FDFDFB` | `#262626` | Inputs, popovers, the Ask panel |
| `--border` | `border-line` | `#CFCFC8` | `#3A3A36` | Hairlines, list dividers |
| `--text` | `text-ink`, `border-ink` | `#0A0A0A` | `#F2F2EE` | All body copy and headings, structural rules, chip outlines |
| `--text-muted` | `text-muted` | `#55554F` | `#A3A39B` | Dates, captions, meta only. Never body copy |
| `--accent` (red) | `text-accent`, `bg-accent` | `#C42A14` | `#FF6A4E` | Impact numbers (`Stat`) and the one primary button. Nothing else |
| `--accent-hover` | `*-accent-hover` | `#A32310` | `#FF8A72` | Hover of the above |
| `--accent-2` (cobalt) | `text-accent-2`, `border-accent-2` | `#1B4FD8` | `#7F9CFF` | Links, focus ring, diagram flow lines, travelling dots, the LLM tile, status dots, active nav underline |
| `--accent-2-hover` | `*-accent-2-hover` | `#1640B0` | `#9DB3FF` | Hover of the above |
| `--on-accent` | `text-on-accent` | `#FFFFFF` | `#0A0A0A` | Label on a red fill |

All pairs are WCAG AA in both themes (table in NOTES, Phase 2). Red is 4.8:1 on surface in light, so red text is only ever large (`text-3xl` and up). Bronze, silver and gold tints appear only inside the medallion diagram, never elsewhere. No success or warning hues: status is a dot plus a word in cobalt (filled = running, outlined = in progress, none = neutral).

## Typography

One family: Archivo (`next/font/google`, variable weight, `wdth` axis, `--font-archivo`). Hierarchy comes from weight and width, not from a second face.

- Display (`h1`, `h2`, `Stat` figures, name in nav): weight 700, `font-stretch: 125%` (`font-stretch-expanded`), letter-spacing -0.02em.
- `h3`: 700 at 112.5% (`font-stretch-semi-expanded`). `h4`: 600, normal width.
- Body: 400; emphasis and labels 500; buttons 500. Numbers data-shaped (dates, IPs, GPAs) use `tabular-nums`, not a mono face.
- Scale (fluid, 390px to 1280px): `text-xs` 12, `text-sm` 14, `text-base` 16 to 17, `text-lg` 18 to 20, `text-xl` 20 to 24, `text-2xl` 24 to 32, `text-3xl` 30 to 44 (section h2), `text-4xl` 40 to 72 (hero h1). Body line-height 1.55.
- Measure: `max-w-measure` (65ch) for paragraphs; never a full-width paragraph.
- Sentence case everywhere. No all-caps labels, no tracked-out eyebrows, no single coloured word inside a headline.

## Spacing, shape, depth

- 4px base scale (Tailwind default). Two named rhythms: `px-gutter` (16 to 40px) and `py-section` (64 to 112px). Page `max-w-page` 1200px.
- Square corners everywhere. `rounded-sm` (2px) exists only for the focus ring; `rounded-full` only for status dots and travelling dots.
- Structure is drawn with rules, not shadows: sections open with a 2px ink rule (`border-t-2 border-ink`), cards and diagram panels with a 3px ink rule, list items with a 1px `border-line`. The only shadow is `shadow-lift` on a hovered card.
- Layout is left-aligned on a 12-column grid with deliberate asymmetry (7/5, 5/7, 6/6 spans). Never centre whole sections.
- Focus: `outline 2px solid var(--accent-2)`, offset 3px, identical for `:focus-visible` and hover states.

## Motion

- Only `transform` and `opacity` animate (plus `background-color`/`color` on hover). One easing: `--ease-out-quart` (`cubic-bezier(0.25, 1, 0.5, 1)`).
- Hover and focus: 150 to 200ms. Cards lift 2 to 4px (`-translate-y-0.5`), border goes to cobalt, arrows slide 2px.
- Page-load entrance (hero only): `.enter`, 400ms, 70ms stagger, finished under 700ms.
- Scroll reveals: `Reveal` primitive, 600ms fade and 14px lift, fires once, never on content already on screen, no layout shift.
- Diagrams: cobalt dots travel the connectors on a loop and each stage lights as a dot arrives (see `.medallion-*`). Loop only while in view and while the tab is visible.
- Reduced motion: nothing moves except the theme colour fade. Entrance, reveals and dots are all gated behind `@media (prefers-reduced-motion: no-preference)`; the reduced default is the finished, lit, still state. Diagrams must read fully without motion.

## Avoid

Gradient heroes, glass or frosted cards, neon grids, stock tech imagery, centred-everything template layouts, identical rounded cards with soft grey shadows, all-caps eyebrow labels, numbered markers on content that is not a sequence, arrows appended to link text, a monospace face for data labels, purple or blue gradients, a second accent hue, decorative icons without a job, more than one red element per viewport, hover transitions on every element, scroll-triggered motion on every section. In copy: em and en dashes, the words leverage, seamless, robust, cutting-edge, passionate, synergy, spearheaded, utilize, delve.

## When tokens change

Edit `globals.css` first, then this file (the `/design-preview` style guide was removed in Phase 10). Re-check AA contrast for every changed pair in both themes and record the ratios in `docs/REDESIGN_NOTES.md`.
