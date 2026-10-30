# v3 concepts (Phase V1)

Three concepts drawn from Srujan's own work, each built as a throwaway scrolling prototype with real facts (every figure and sentence is read from `src/data/graph` and `src/content/profile.ts` through `src/app/lab/_lib/facts.ts`; nothing is typed into a prototype).

| | Prototype | Evidence |
|---|---|---|
| A. The Pipeline | `/lab/a` | `docs/v3/concepts/a/` |
| B. The Notebook | `/lab/b` | `docs/v3/concepts/b/` |
| C. The Spec Sheet | `/lab/c` | `docs/v3/concepts/c/` |

Each evidence folder has `desktop-light`, `desktop-dark`, `mobile-light`, `mobile-dark` (first screen plus one screenshot per scroll step), a scroll video `scroll.webm` in the two light folders (about 10 s, 1440 and 390), and `reduced/full.png` (a full-page capture under `prefers-reduced-motion: reduce`, where the motion layer never starts). Re-run with `node --experimental-strip-types scripts/v3-concepts.mts` against a running dev server.

All three share one motion setup (`src/app/lab/_lib/motion.ts`): Lenis on GSAP's ticker feeding ScrollTrigger, entrances under 1.2 s, one easing (`power3.out` for entrances, `none` for scrubs), and a reduced-motion branch that leaves native scroll and the finished state. Count-ups keep the real figure in the HTML and in `data-count`.

Each prototype is a hero, one scroll-driven sequence, and one project teaser, as the runbook asks. Ask, ⌘K and the lenses are described, not built.

---

## A. The Pipeline

**Pitch.** The site is a data pipeline, and scrolling runs one record through it.

**Palette.** Two neutrals and one accent; the medallion tints appear only in the hero diagram and on the travelling record, as in v2.

| Role | Light | Dark |
|---|---|---|
| Page | `#F1F2EE` | `#0D1014` |
| Ink | `#0F1318` | `#E4E7E2` |
| Accent (data path, figures, links) | `#1D4ED8` | `#7C9BFF` |
| Bronze / silver / gold (diagram only) | `#9A5F35` / `#7C838B` / `#9C7A1C` | `#D08B57` / `#B5BCC3` / `#E0B84A` |

**Type.** Geist 600 for display (name up to 160 px, letter-spacing -0.045em), 500 for headlines, 400 body; Geist Mono 400 for stage labels and the record's state only.

**Motion signature.** One thin rail runs down the whole page. It fills with the accent as you scroll, and a record rides it, scrubbed to scroll position. At each stage the record changes state and colour: bronze `raw`, silver `cleaned`, gold `modeled`, accent `answer`, and that stage's node lights. In the hero the medallion builds itself left to right.

**Home, screen by screen.**
1. `stage 01 / ingest`: name, the headline, the status line, the medallion building itself, resume and email.
2. `stage 02 / transform`: "What I build", a pinned sideways reel of the four featured projects (desktop); each panel leads with one big figure.
3. `stage 03 / serve`: "What it did", five figures counting up as they arrive, each with its one-line source.
4. `stage 04 / query`: "Ask about my work" (opens the palette in Ask mode), email, GitHub, LinkedIn, resume.

**Project page.** Same rail continues; the case study is a run of that project: `input` (problem), `transform` (approach, with the project's own diagram drawn by scroll), `output` (figures). Breadcrumb `pipeline / work / surplus-ai`.

**Ask and lenses.** Ask is the `query` stage; answers come back as "rows" with their sources. Lenses on `/explore` are "views" of the same table: Timeline, Skill map, By problem, By industry.

**Recruiter path.** Name, line, status and resume on screen 1; four projects with one figure each on screen 2. `/cv` is a plain one-pager.

**Mobile.** The rail moves to a 20 px gutter; the record keeps its colour but drops its text label; the reel becomes a native swipe with snap; nothing pins.

**Risk.** The rail and record are the whole concept; if they read as decoration rather than meaning, the site becomes a clean template with a line down it. On phones the hero medallion gets small (its labels render at 7 to 10 px at 390), so it needs a vertical layout there.

## B. The Notebook

**Pitch.** The site is a running data notebook: cells execute as you reach them and show their output.

**Palette.**

| Role | Light | Dark |
|---|---|---|
| Paper | `#F7F6F1` | `#121413` |
| Ink | `#1B1D1C` | `#E6E7E1` |
| Accent ("executed": cell bar, output keys, the result figure) | `#0B7A52` | `#52D19C` |

**Type.** Newsreader (variable, optical size 72 for display) 400 for markdown cells: the name up to 168 px, italic for the lede; IBM Plex Mono 400/500/600 for code cells, gutters and outputs.

**Motion signature.** A cell's gutter goes `In [ ]` → `In [*]` → `In [n]` as it scrolls into view, the kernel indicator in the top bar flips to busy, and the output wipes in. `n` is the order the reader reached the cells, so every visit numbers them differently. In the scrubbed cell, the Surplus AI bar shrinks from about 15 min to about 3 min as you scroll and the ~80% counts up with it (pinned on desktop).

**Home, screen by screen.**
1. Title cell (name, lede) and `whoami()` (what he does, where, now, email, resume).
2. `surplus.minutes_per_item(before, after)`: the scrubbed chart.
3. One cell per featured project with its results table (prototype shows Label Lens).
4. `contact()`.

**Project page.** A notebook per project: Problem, Approach, Results as markdown and code cells; the architecture diagram is a cell output.

**Ask and lenses.** ⌘K opens a "kernel" palette (jump, Ask, theme, resume). Ask answers render as an output cell with sources as a table. Lenses are cells with different queries over the same graph.

**Recruiter path.** The `whoami()` output is the 30-second answer; `/cv` is a plain one-pager.

**Mobile.** Gutters move above each cell; long code lines scroll inside their cell; the chart scrubs without pinning.

**Risk.** The most "costume" of the three: the notebook frame and a serif plus a mono make busier pages, and the cleverness (execution counts, kernel state) only lands with people who use Jupyter. Of the three it is the least striking at first glance.

## C. The Spec Sheet

**Pitch.** An engineering datasheet for a person: oversized condensed type, hairline rules, figure numbers, and the impact figures as the only imagery.

**Palette.** Black, white, one red for the figures that matter.

| Role | Light | Dark |
|---|---|---|
| Page | `#FFFFFF` | `#000000` |
| Ink | `#000000` | `#FFFFFF` |
| Accent (headline figures only) | `#C8200E` | `#FF5B45` |

**Type.** Archivo on its width axis: 800 at 62% width for the name (up to 350 px) and the figures, 600 to 800 at 112% for section titles, 400 body; Martian Mono 400 for figure numbers and table keys only.

**Motion signature.** Type and rules. The name rises out of a mask line by line while the spec-table rules draw left to right; the About paragraph lights up word by word as you read it; in `fig. 01` an enormous number counts down from 15 to 3 minutes, scrubbed, while a marker slides along a 0 to 15 scale (pinned on desktop).

**Home, screen by screen.**
1. Header strip and the name at full width; spec table: Function (the headline), Profile, Status, Contact.
2. About, revealed as you read.
3. `fig. 01`: per-item minutes at ASU Surplus, about 15 to about 3.
4. `fig. 02`: selected figures in a grid.
5. `fig. 03`: a project datasheet (prototype: DevHacks × Cubbie, with "1st" in red), then contact.

**Project page.** A datasheet: title block, a table of specs (role, date, stack, links), figures, and the architecture drawn as `fig. n` with rules and labels drawing in.

**Ask and lenses.** Ask returns "readings" with source references like footnotes. Lenses are tables of contents sorted different ways.

**Recruiter path.** The spec table on screen 1 is the answer; `/cv` is the same sheet, printable.

**Mobile.** Name still fills the width; tables stack key above value; `fig. 01` scrubs without pinning.

**Risk.** It is the v2 direction ("Spec sheet") turned up. It is the most striking and the safest for recruiters, but it may not feel like the new concept Srujan asked for, and black, white, hairlines and a condensed face are close to Russell Numo's look (we borrow the principle, not the layout).

---

## Recommendation

**A's structure with C's typography.** The Pipeline is the only concept that belongs to a data engineer and gives scrolling a meaning (you are moving a record through the system he builds). Its weakness is that it looks calm and clean rather than striking. C's type (Archivo condensed at huge sizes for the name and figures, Martian Mono only for labels) and its black and white neutrals fix that, while the rail, the travelling record and the stage names keep the concept. Keep one accent, cobalt (`#1D4ED8` / `#7C9BFF`), for the data path and the figures; drop C's red so the page has one accent. Take B's numbered execution as an idea for small moments (the 404 and Ask answers can show `In [*]`), not as the frame.
