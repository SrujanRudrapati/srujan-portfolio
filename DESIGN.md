# DESIGN.md: Srujan Portfolio, v5 "Thread"

The design system of the live site, ported from the prototype `design/redesign.html`. Tell an agent: *"Build this following DESIGN.md."* Earlier versions (v1 dark amber, v2 Spec sheet, v4 Midnight & Bronze) are in git history.

**Sources of truth:** tokens and section patterns in `src/app/globals.css`; section themes in `src/lib/themes.ts`; fonts in `src/app/layout.tsx`; the drawings in `src/components/v5/art/drawings.tsx`; the home copy in `src/data/home.ts`; every fact in `.claude/skills/portfolio-facts/SKILL.md`. If this file and the code disagree, fix one so they match.

---

## 1. Idea

One hand-drawn line runs through the whole page. It starts in the hero, weaves over and under the letters of every giant heading, passes each project, and ends by drawing a kolam (a looped South Indian floor pattern) around "Let's talk". Everything else supports it: paper colours that change per section, line-art scenes that draw themselves, and wide black type.

- **Line art, not illustration.** Strokes of 1.5px in ink, accents of 2px in the thread colour. No fills except the ground and small thread dots.
- **Proof up front.** Each project leads with problem, what was built, and figures; the first figure gets a hand-drawn ring.
- **Toys, labelled as toys.** Three small demos show how a project behaves. Each says it is a toy version with made-up data.
- **Light only.** Each section has its own paper; the last one (Let's talk) is night.

---

## 2. Colour

Three registered colours carry the palette. They are declared with `@property` (type `<color>`) so that when the home page swaps them per section, the browser fades them over 0.9 s instead of jumping.

| Token | Default (paper) | Role |
|---|---|---|
| `--ground` | `#f4f0e8` | Page and section background |
| `--ink` | `#26241f` | Text, strokes, rules, card borders and shadows |
| `--thread` | `#c2673f` | The line, the ring, accents, large figures |

Derived (never typed as hex):

| Token | Formula | Role |
|---|---|---|
| `--mute` | ink 72% into ground | Secondary text. The prototype used 66%; 72% keeps 4.5:1 on every theme (sync dropped to 4.3:1) |
| `--edge` | ink 24% | Hairlines, chip borders, placeholder dashes |
| `--panel` | ink 6% | Card fill |
| `--thread-text` | thread 55% into ink | Thread-coloured small text (labels, link hovers). The raw thread is a line colour and reaches only 2.5 to 3.9:1 on some grounds |

### Section themes (`src/lib/themes.ts`)

A section opts in with `data-theme="<name>"`. The thread applies its colours to `<html>` when the section crosses 55% of the viewport, and removes them when the home page unmounts, so other pages stay on paper.

| Theme | Ground | Ink | Thread | Used by |
|---|---|---|---|---|
| paper | `#f4f0e8` | `#26241f` | `#c2673f` | Hero, More projects, About |
| surplus | `#eddcd2` | `#3a2024` | `#b0563f` | Surplus Station |
| invoice | `#dfe8dc` | `#1f2d25` | `#c2673f` | InvoiceGuard |
| label | `#f1e7c6` | `#2b2516` | `#4f6fa8` | Label Lens |
| sync | `#d9e3ec` | `#1c2a3a` | `#b8862b` | RecordSync |
| hacks | `#e4dff0` | `#262238` | `#6b5bb5` | DevHacks |
| celebal | `#d5e4e1` | `#17302f` | `#c26a3a` | Celebal Technologies |
| night | `#1f2a2b` | `#f0ebdf` | `#e0b464` | Let's talk |

### Background patterns

Each themed section draws a tile in ink at 11% opacity (label 13%, night 20%) as a `::before` mask, faded out over the top and bottom 9% so sections blend. Tiles: dots (paper), crosshair grid (surplus), ledger lines (invoice), paired dots (label), plus signs (sync), scattered marks (hacks), waves (celebal), stars (night). The highlights strip uses paper's dots through `data-theme-tile="paper"`.

### Contrast rules

- Body text on ground is at least 4.5:1 on every theme; axe runs on the home page in CI.
- Never set small text in raw `--thread`; use `--thread-text`. Raw thread is fine for lines, rings, large figures (3:1) and the tick counter.
- Highlight states in the demos use an ink background with a thread edge (the prototype used thread fills, which failed contrast with ground-coloured text).

---

## 3. Type

| Face | Loaded by | Use |
|---|---|---|
| Archivo, variable weight and width (`wdth` 62 to 125) | `next/font/google`, `--font-archivo` | Everything readable, and the display type |
| IBM Plex Mono 400, 500 | `next/font/google`, `--font-plex-mono` | Labels, kickers, nav, stack chips, demo cards |

Display style (`.display`, or `wide` in the section module): weight 900, `font-stretch: 125%` with `font-variation-settings: "wdth" 125`, letter-spacing -0.02em, uppercase, line-height about 0.9.

| Role | Size |
|---|---|
| Giant headings | Fitted to the heading width by script; capped at 52vw on phones, 19vw from 860px; hero also at 24vh |
| Hero sentence (h1) | `clamp(1.35rem, 3vw, 2.5rem)`, weight 600, max 22em |
| Section headings (Skills, Experience) | `min(9.2vw, 7rem)` display |
| Project figures | `clamp(1.55rem, 5.6vw, 3.2rem)` display |
| Highlights figures | `clamp(2.2rem, 7vw, 5rem)` display |
| Body | 17px, line-height 1.5 |
| Mono labels | 12 to 12.5px, uppercase, letter-spacing 0.07em |

**Giant headings** (`src/components/v5/Giant.tsx`): each line is a `nowrap` block of letters; every other letter sits above the thread (`z-index: 3`) or below it (`z-index: 1`), so the line weaves through the word. The visual letters are `aria-hidden`; an `sr-only` name is the heading's accessible text. Before fitting, CSS guesses the size from the letter count (`--chars`), so the layout barely moves when the script measures.

Copy rules: no en or em dashes ("4 to 9 s", "1 to 2 h"); `~` and "about" markers are kept; see the facts skill for banned words.

---

## 4. Space and layout

- Side gutter `--pad: clamp(18px, 4.6vw, 72px)` on every section, the nav and the footer.
- Sections are full-bleed and `position: relative; overflow-x: clip` (their ghosts and edge pins bleed past the heading on purpose; the clip keeps the page from ever scrolling sideways).
- Project sections: kicker and one-line lede on top, the spread (see Components), the giant heading, then a two-column grid from 860px (text 1.1fr, card 0.9fr, 64px gap; the card is sticky at 110px). `flip` mirrors the scene and the card.
- Grids always use `minmax(0, 1fr)` columns and `min-width: 0` children, so long words wrap instead of widening a track.
- One breakpoint, 860px, as in the prototype. Phones get one column, two-up figures, and the nav without "About".
- Tap targets are at least 44 by 44px (nav, links, demo buttons, placeholders).

---

## 5. Components

| Component | File | Notes |
|---|---|---|
| Thread | `src/components/v5/thread/Thread.tsx` | One SVG in `<main>`: a Catmull-Rom spline through every `Pin` in document order, then two hypotrochoids and 24 dots for the kolam. Draws to 64% down the viewport, eases toward it, carries six beads and a pulsing head. Also fits the giants, applies themes, moves ghosts, and marks `[data-reveal]` sections `data-in` once 12% visible. Geometry is pure and unit tested (`geometry.ts`). |
| Pin | `src/components/v5/Pin.tsx` | A 1px point the thread passes through; `kolam` marks the centre of the ending. A pin with `display: none` at the current width is skipped. |
| Spread | `src/components/v5/Spread.tsx` | How every project section opens (home and project pages): the main scene in one column, three small drawings with HTML `figcaption`s in the other (2 by 2 from 860px, v2 spanning both rows; a row of three under the scene on phones; sides swap on flipped sections). Pins sp0, vp1 and vp2 keep the thread in the 6vw gap; vp3 (desktop only, not in the prototype) sits below and toward the heading, so the curve leaves the gap straight instead of clipping the bottom drawing as the prototype did at 1440px. Captions are copy in `src/data/home.ts`, checked against the facts; 11px at 360px easing to 12px (12.5px from 860px). |
| Giant | `src/components/v5/Giant.tsx` | Woven heading (see Type). |
| Scene | `src/components/v5/Art.tsx` | Line-art drawing; every stroke has `pathLength="1"` and draws in over 1.5 s, 35 ms apart, once its section is in view. Captions fade in after. |
| Ghost | same | Oversized faint copy of a project's drawing behind its heading (11% opacity), moved at -0.14 of scroll and tilted ±9°. |
| Ring | same | A hand-drawn ellipse around the first figure of each project, drawn 0.9 s after the section appears. |
| Icon | same | 40px (48px from 860px) line icons for More projects rows. |
| LiveCard | `src/components/v5/cards/LiveCard.tsx` | Card shell: panel fill, 1.5px ink border, 4px radius, 7px offset ink shadow, mono. Its CSS animations run only while on screen. |
| Toy demos | `InvoiceToy`, `LabelToy`, `SyncToy` | Tamper with an invoice total, pick an allergy, match two records. State in React, results in `aria-live` regions, a "toy version" line under each. |
| Illustrations | `PalletCard`, `ReceiptsCard` | Bars to scale (90 min vs 10 min) and a chat loop. Marked as illustrations. |
| Cert cards | `src/components/v5/home/CertCards.tsx` | Certified: one card per certification (ground fill, 1px ink border, 4px radius, no shadow): the official badge at 88px from `public/badges/`, used as supplied (`object-fit: contain`, never cropped or recoloured, alt text is the name), the full name, the issuer in mono. Five in a row from 860px; two columns below with the fifth centred at one column's width. A badge file that is not there yet shows a neutral dashed "Badge to come" frame. Data in `src/data/certifications.ts`; adding `verifyUrl` to an entry adds a "Verify" link. |
| Tick | `src/components/v5/Tick.tsx` | Records since the page opened at 10M a day; `aria-hidden` because it changes ten times a second. |
| More row | `src/components/v5/home/MoreProjects.tsx` | Full-width link; ink fills up from the bottom on hover or focus, text turns ground. |
| Links | `src/components/v5/home/Links.tsx` | Mono links with a thread underline. A link Srujan has not supplied yet renders as dashed, unclickable text ("GitHub: repository link to come"), never as a dead `href`. |
| Nav | `src/components/shell/Header.tsx` | SR, Projects, About (860px+), Contact, Ask. Slides away scrolling down past 140px, returns on any scroll up or keyboard focus. Links point at `/#work`, `/#about`, `/#contact`, so they work from every page. |
| Cursor | `src/components/shell/ShellEffects.tsx` | A 92px thread disc that grows to say "View" over the giant project headings and More rows. Fine pointers only, transform only, off under reduced motion. |
| Footer | `src/components/shell/Footer.tsx` | Name and Back to top, mono. |

The command palette (⌘K or /), the Ask panel and the 404 pipeline game keep their v4 logic and read the v5 tokens through aliases (`--bg`, `--text`, `--accent` and so on map to the v5 names at the top of `globals.css`). They get a proper restyle with the project pages.

---

## 6. Motion

- **No animation libraries.** CSS animations and transitions, the `@property` colour fade, and one `requestAnimationFrame` loop for the thread. Scrolling is native (Lenis was removed).
- Hero intro: letters rise 60% with `cubic-bezier(0.16, 1, 0.3, 1)` over 0.9 s, 35 ms apart from 0.1 s; the role line, sentence and availability line fade up at 0.7, 0.8 and 0.9 s; the thread draws in over 2.2 s after 0.4 s (ease in-out).
- Drawing ease `--ease-draw: cubic-bezier(0.5, 0, 0.2, 1)`; UI ease `--ease: cubic-bezier(0.2, 0.8, 0.2, 1)`.
- Only `transform`, `opacity`, `stroke-dashoffset` and the registered colours animate.
- Card loops (pallet bars, chat) pause off screen.

### Reduced motion

`prefers-reduced-motion: reduce` gives the finished page: every drawing and ring is complete, captions visible, the hero still, the theme changes instantly, the thread follows the scroll without easing, beads and the halo pulse are off, ghosts do not drift, card loops are still, and the cursor is off. The global rule sets `transition-duration: 0s` (not 0.01ms, which would transition every property because `transition-property` defaults to `all`, and broke heading measurement).

Without JavaScript, the `data-js` flag on `<html>` is never set, so the scenes render finished instead of hidden.

---

## 7. Accessibility

- One `h1` per page (on the home page, the hero sentence). Giant names are `aria-hidden` letters with an `sr-only` heading name.
- Demo buttons use `aria-pressed` where they toggle; verdicts and warnings are `aria-live="polite"`.
- External links say "(opens in a new tab)" to screen readers.
- Focus ring: 2px thread outline, 4px offset. The nav never hides while it holds focus.
- Checked in CI: axe (WCAG 2.2 AA) on every route, keyboard focus on every stop, 44px targets at 360 to 1024px, and `e2e/v5-overflow.spec.ts` at 360, 390, 768 and 1440px (no text past its box, its container or the screen; no page scrolls sideways).

---

## 8. Build and deploy

Static export for GitHub Pages: `output: "export"`, `images.unoptimized`, `basePath` from `NEXT_PUBLIC_BASE_PATH` (CI sets `/srujan-portfolio`), `.nojekyll`. Fonts are self-hosted by `next/font`; there are no CDN scripts. Root-relative URLs that are not `next/link` (the résumé) go through `withBasePath`. Old addresses that changed get a static meta-refresh page (for example `/work/surplus-ai` to `/work/surplus-station`).

---

## 9. Don'ts

- No gradients, glows, blur, or drop shadows other than the card's hard offset shadow.
- No raw thread for small text; no hex outside `globals.css` and `themes.ts`.
- No invented facts, figures or links. A missing link is a visible placeholder.
- No animation runtime or smooth-scroll library.
- No dark mode toggle; the night theme is a section, not a mode.
