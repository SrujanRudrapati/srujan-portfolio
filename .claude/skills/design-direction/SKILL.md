---
name: design-direction
description: The chosen visual direction for the portfolio redesign ("Spec sheet"): palette hex values for light and dark, Archivo type rules, spacing scale, radii, motion rules, status vocabulary, and the explicit avoid list. Load whenever creating or styling any component, page, section, card, SVG, diagram, animation, or Tailwind class on the portfolio site, and whenever tokens in globals.css change (then update this file too).
---

# Design direction: Spec sheet

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
