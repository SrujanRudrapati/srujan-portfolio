---
name: design-direction
description: The chosen visual direction for the portfolio. v5 "Thread" (light only, Archivo + IBM Plex Mono, per-section paper themes, a scroll-drawn line through the page, line-art scenes; spec in DESIGN.md, prototype design/redesign.html) supersedes v4 "Midnight & Bronze" from DECISIONS 26 on; the v4 notes below are history. Covers token values, type rules, radii, surfaces, layout and interaction notes per page, the banned list, and copy rules. Load whenever creating or styling any component, page, section, card, SVG, diagram, animation, or CSS on the portfolio site, and whenever tokens in globals.css change (then update this file too).
---

# v5 direction: Thread (DECISIONS 26, 2026-11-13). Read DESIGN.md first.

`DESIGN.md` is the v5 spec: tokens (`--ground`, `--ink`, `--thread` registered with `@property`, derived `--mute`, `--edge`, `--panel`, `--thread-text`), the eight section themes in `src/lib/themes.ts`, Archivo (wide black display at `wdth` 125) and IBM Plex Mono, the 860px breakpoint, 4px radii, the card's hard 7px ink shadow, and the components in `src/components/v5/`. When v5 and the v4 notes below disagree, v5 wins. Light only; no Bodoni, Hanken, metal gradient, grain, glow or rounded tiles. The v4 token names (`--bg`, `--text`, `--accent`...) survive only as aliases in `globals.css` for pages not yet restyled.

---

# History: v4 direction, Midnight & Bronze (runbook v4, 2026-11-01)

Source of truth for look, layout, spacing, motion and interaction: the approved reference `docs/v4/reference/srujan-premium-concept.html` (screenshots in `docs/v4/reference-shots/<viewport>/`). Where the reference and `docs/REDESIGN_V4_RUNBOOK.md` disagree, the runbook wins. Motion detail lives in `motion-system`; facts in `portfolio-facts`.

Feel: a quiet, expensive object. Midnight graphite, one warm metal, a high-contrast Didone for display and a plain grotesk for reading. Depth comes from soft rounded surfaces, a faint top glow and grain, never from colour noise.

## Tokens (exact; CSS custom properties in `src/app/globals.css`)

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0B0F14` | Page (midnight graphite) |
| `--surface` | `#141B23` | Raised panels that need an opaque fill (portrait frame, dialogs) |
| `--text` | `#E8EAED` | All body text and headings |
| `--muted` | `#8D98A5` | Meta, intros, descriptions, labels (steel) |
| `--accent` | `#C49A6C` | Bronze: hints, focus ring, cursor, active pills, chart bars, link underline |
| `--line` | `rgba(232,234,237,.11)` | Hairlines and borders |
| `--metal` | `linear-gradient(180deg,#EED7B4 0%,#C49A6C 45%,#8C6845 72%,#E2C59E 100%)` | Key numbers only, as `background-clip: text` (`.metal`) and the scroll progress line |
| Live dot | `#7CC4A4` with a soft 2.4 s pulse | The "Now" line only |
| Page glow | `radial-gradient(110% 55% at 50% -12%, #1A2633, transparent 62%)` | On `body`, scrolls with the page (never `fixed`) |
| Grain | static SVG fractal noise, opacity `.035` | One fixed `body::after`, no animation, no blend mode |
| Easing | `cubic-bezier(.16,1,.3,1)` (`--ease`) | Everything |

Dark only: `color-scheme: dark`, no theme toggle, no light tokens. `/cv` keeps a print stylesheet that prints black on white.

**Tile surface:** `rgba(232,234,237,.035)` fill, 1px `rgba(232,234,237,.09)` border, `box-shadow: inset 0 1px 0 rgba(255,255,255,.05)` (plus `0 30px 60px -40px rgba(0,0,0,.6)` on the home tiles). **Soft pill:** `rgba(232,234,237,.06)` (back pill), `.07` (segmented control track, list tags), `.08` (round arrow buttons); hover steps up by about `.06`.

**Radii:** tiles and list rows 24px · panels, bands, composer, portrait, timeline 28px · catalogue stage and its cards 32px · pills, buttons, segmented control, arrow buttons 999px. Nothing is square-cornered except the timeline milestone diamond (4px).

## Type

- **Display:** Bodoni Moda 400 and 500, plus 400 italic (hover state of "Next project"), via `next/font/google`; fallback `Didot, 'Bodoni 72', Georgia, serif`. Used for the name in the header, h1 titles, tile names, project names, key numbers, the About statement, the email, the timeline detail title. Letter-spacing -0.025em on large titles, -0.02em on names. Weight 400 almost always.
- **Text:** Hanken Grotesk 400 and 500 via `next/font/google`; fallback `system-ui, -apple-system, 'Segoe UI', sans-serif`. Body 17px / 1.6. Labels and meta 13 to 15px.
- Sizes follow the reference's `clamp()` values: page title `clamp(44px, min(7vw, 11vh), 112px)` line-height .95; home h1 `clamp(40px, min(6.6vw, 11.5vh), 112px)` line-height .98 (tightened to `min(6.2vw, 9.6vh)` at ≥901px wide and ≤820px tall); tile name `clamp(28px, 3vw, 42px)`; card name `clamp(44px, 6vw, 92px)`; email `clamp(30px, 6vw, 92px)`.
- Sentence case. No all-caps, no tracked-out eyebrows, no monospace.

## Layout

- Content width `.wrap`: `min(1240px, 100% - 48px)` centred (a 24px gutter on phones). No horizontal page scroll at any width.
- Fixed header 60px: name left (Bodoni 20px, links home), "Available early 2027" with a bronze dot (4px bronze halo) right. Nothing else; no nav links, no theme toggle. Transparent at the top; after 30px of scroll `color-mix(in srgb, var(--bg) 90%, transparent)` + `backdrop-filter: blur(10px)` + hairline bottom border.
- Inner pages start `padding-top: clamp(92px, 14vh, 140px)`, then the back pill, then the Bodoni title, then a muted one-line intro (max 52ch).
- Footer: hairline top, name and year left, live Arizona time, nothing else claiming draft status.

## Page notes

- **Home (hub):** headline (three masked lines), lede (first sentence in `--text` 500, rest muted, max 46ch), now line, then one line on the now text's indent with the Ask link (accent underline) followed by quiet muted links to email, LinkedIn and Resume (PDF) (DECISIONS 24b), then four tiles in one row on desktop (2×2 under 900px). The dot field sits top right on desktop (`width: min(46vw, 620px)`, `height: min(40vw, 52vh, 500px)`, a faint bronze radial behind it) and full width above the headline on phones. At 1280×720 to 1920×1080 everything fits in one viewport.
- **Tiles:** Bodoni name, bronze hint (13px), muted description pinned to the bottom, 34px arrow circle top right that turns 45° on hover (hidden under 900px). Hover: 4px lift, bronze border at 40%, a 240px bronze radial (`.16`) following the pointer via `--mx`/`--my`.
- **Work:** title and intro left, segmented Catalogue/List control right (white highlight that slides). Catalogue stage 32px radius, `height: clamp(320px, calc(100svh - 460px), 620px)`, one card at a time; card: kicker top left, key number top right (Bodoni, with a sans sublabel), big name bottom left, description + tags + "Open the project" bottom right; dark bottom shade over the art. Controls row: "2 of 4" with a quiet 44px pause/play button beside it, progress pills (8px dots; the active one a 28px bronze track that fills over the 5 s autoplay), two 44px round arrows. List: rounded rows `112px | name+kicker | description+tags | key number (metal)`; under 900px `80px | rest`.
- **Art plates:** the reference's four CSS gradient plates (navy, steel, bronze) one per featured project, in that order; smaller projects use a plain dark plate `linear-gradient(160deg,#1A2430,#0F141A)`. Screenshots only on the project page, never on catalogue cards.
- **Project page:** back pill "All work"; band (art, 28px radius, `height: min(56vh, 520px)`, kicker and Bodoni name over a bottom gradient); up to three result tiles (metal number + muted label); two-column "What it does" (title 1fr, bullets 2fr, hairline separated); diagram; stack pills; link buttons; "Next project" row with a large Bodoni name that turns italic on hover.
- **Experience:** rounded panel with a year axis and lanes (200px label column); bars are bronze outlines with a 16% fill, solid bronze when hovered or selected; milestone is a 24px diamond; a "Today" line; detail panel below (dates left, Bodoni title, bronze organisation, muted bullets).
- **About:** portrait frame (4:5, 28px, sticky on desktop) left, Bodoni statement right, two muted paragraphs, facts grid (2 columns, hairline top).
- **Contact:** email in large Bodoni with an underline that draws on hover; composer panel (28px) with a Bodoni textarea, "Copy email" (outline) and "Open in my email app" (solid white, bronze on hover); muted links row.
- **Buttons:** 50px pills, 1px `--line` border, bronze border on hover; the solid variant is `--text` on `--bg`, bronze on hover.

## Banned (they caused lag or read as template)

Animated full-screen overlays; `mix-blend-mode` on large layers; `backdrop-filter` anywhere except the header (and the Ask panel's header); CSS `filter` transitions on large elements; `shadowBlur` in canvas loops; `background-attachment: fixed`; light mode; nav links in the header; a second accent hue; gradients on text other than key numbers; monospace labels; square cards; stock imagery; decorative icons without a job.

## Copy

Sentence case, no em or en dashes in UI copy, typographic apostrophes (’), facts only (`portfolio-facts`). Banned words: leverage, seamless, robust, cutting-edge, passionate, synergy, spearheaded, utilize, delve.

## Accessibility

Focus ring `1.5px solid var(--accent)`, offset 4px, everywhere. Measured: `--text` on `--bg` 15.95:1; `--muted` on `--bg` 6.56:1 (on `--surface` 5.92:1); bronze on `--bg` 7.49:1 (on `--surface` 6.76:1); `--bg` on bronze (cursor label, selected bars) 7.49:1. All AA at every size; recheck any new pair. Tap targets at least 44px on touch.

## When tokens change

Edit `globals.css` first, then this file. Re-check AA contrast for every changed pair.

## History

v3 "Pipeline" (Archivo + Martian Mono, black/white with one blue accent, 3D scenes, rail) and v2 "Spec sheet" are retired; their records are in `docs/REDESIGN_V3_STATUS.md`, `docs/v3/` and `docs/REDESIGN_NOTES.md`.
