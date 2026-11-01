# Portfolio v4 Runbook — "Midnight & Bronze" (for Claude Code)

**Owner:** Srujan Rudrapati · **Email:** rudrapati.srujan@gmail.com
**Repo:** srujan-portfolio (Next.js static export → GitHub Pages, basePath `/srujan-portfolio`)
**Approved design reference:** `docs/v4/reference/srujan-premium-concept.html` (single HTML file Srujan approved; open it in a browser)
**Date:** 2026-11-01

Claude Code: this runbook rebuilds the site's presentation to match the approved reference. Every operating rule in `docs/REDESIGN_RUNBOOK.md` still applies (no invented facts, never delete content without asking, static export for GitHub Pages, evidence per phase, STATUS ledger, DECISIONS file, gates) unless this file changes it. Read this file, the reference HTML, and `docs/REDESIGN_V3_STATUS.md`, then execute from the first phase `docs/REDESIGN_V4_STATUS.md` marks incomplete.

Start command:

```
claude "Read docs/REDESIGN_V4_RUNBOOK.md and execute it from the first phase docs/REDESIGN_V4_STATUS.md marks incomplete."
```

---

## 0. What changes and what stays

**Changes (presentation):** the whole visual language, the home page, how sections open, the Work page, the Experience page, About, Contact, page transitions, motion, and colors. The reference HTML is the source of truth for look, layout, spacing, motion and interaction. Match it closely; where the reference and this file disagree, this file wins.

**Stays (content and features from v3):** the knowledge graph and project data, every fact, all case-study content (including architecture diagrams, restyled), Ask Srujan, the "Clean the pipeline" game on the 404, `/cv` (printable), the resume link, tests, the release check, and the deploy setup.

**Reference placeholders to replace with real data:** the Supply Chain Watchtower text, the LinkedIn and resume links, the portrait, and the generic one-word tags on the six smaller projects ("Infrastructure", "Delivery", etc.). Take real descriptions and tags from the graph and existing case studies. If the data has nothing for a field, leave it out; never invent.

**Removed on purpose:** light mode, the header navigation links, the letter-morph transition, the v3 3D/WebGL hero and covers, and the particle "physics" visuals. Removing code is fine; removing content is not (rule 4). Every piece of content those visuals carried must still appear somewhere.

---

## 1. Design tokens (exact)

Put these in `design-direction` (update that skill) and in the CSS custom properties.

| Token | Value |
|---|---|
| `--bg` | `#0B0F14` midnight graphite |
| `--surface` | `#141B23` |
| `--text` | `#E8EAED` |
| `--muted` | `#8D98A5` steel |
| `--accent` | `#C49A6C` bronze |
| `--line` | `rgba(232,234,237,.11)` |
| `--metal` | `linear-gradient(180deg,#EED7B4 0%,#C49A6C 45%,#8C6845 72%,#E2C59E 100%)` for key numbers (background-clip text) |
| Live dot | `#7CC4A4` with a soft pulse |
| Page glow | `radial-gradient(110% 55% at 50% -12%, #1A2633, transparent 62%)` on body, not fixed |
| Grain | static SVG noise overlay, opacity `.035`, no animation, no blend mode |
| Display font | Bodoni Moda 400/500 + italic, via `next/font/google`, with Didot/Georgia fallback |
| Text font | Hanken Grotesk 400/500, via `next/font/google`, system-ui fallback |
| Easing | `cubic-bezier(.16,1,.3,1)` everywhere |
| Radii | tiles 24px · panels and bands 28px · catalogue stage and cards 32px · pills 999px |
| Tile surface | `rgba(232,234,237,.035)` + 1px `rgba(232,234,237,.09)` border + `inset 0 1px 0 rgba(255,255,255,.05)` |

Dark only: `color-scheme: dark`, no theme toggle, no light tokens. `/cv` keeps a print stylesheet that prints black on white.

Copy rules unchanged: sentence case, no em dashes in UI copy, typographic apostrophes, facts only.

---

## 2. Rule changes for v4

- **Branch:** `redesign/v4`. If `redesign/v3` is merged into `main`, branch from `main`. If it is not merged, branch from `redesign/v3`, note it in STATUS, and ship v3 and v4 together at G1 (do not merge v3 separately).
- **Status:** `docs/REDESIGN_V4_STATUS.md` (same format as before).
- **Gates:** G1 merge to main · G2 deleting content · G3 secrets/accounts · **G5 design checkpoint** after Phase W3 (home + work built). No other stops.
- **Dependencies:** keep `lenis`. Remove `three`, `@react-three/*`, `gsap` and any other animation/3D packages if nothing uses them after the rebuild (this also resolves v3 DECISIONS 19, the JS budget). No new UI or animation libraries; the reference does everything with CSS, the View Transitions API, the Web Animations API and a 2D canvas.
- **Performance budget:** initial JS per page ≤ 160 kB gzip; Lighthouse mobile Performance ≥ 90 and desktop ≥ 98; Accessibility 100; CLS < 0.02; no long task > 100 ms after load; the home page keeps 60 fps on a mid-range laptop while dots move.
- **Banned (they caused lag in the concept):** animated full-screen overlays, `mix-blend-mode` on large layers, `backdrop-filter` anywhere except the header, CSS `filter` transitions on large elements, `shadowBlur` in canvas loops, `background-attachment: fixed`.

---

## 3. Phase W0 — Setup

1. Create the branch per Section 2. Copy the reference HTML Srujan provides into `docs/v4/reference/` if it is not there yet (if missing, stop and ask for it in DECISIONS; it is the source of truth).
2. Screenshot the reference with Playwright at 390×844, 1280×720, 1440×900 and 1920×1080 for every view (home idle, home with each tile hovered, work catalogue, work list, a project, experience, about, contact) into `docs/v4/reference-shots/`. These are the targets for visual comparison later.
3. Update the `design-direction` skill (Section 1, plus the layout and interaction notes in Sections 4–9) and the `motion-system` skill (Section 10). Remove physics and particle-hero guidance that no longer applies. Keep `portfolio-facts` unchanged.
4. Load `frontend-design`, `design-direction`, `motion-system`, `portfolio-facts`, `static-export-check`, `phase-verify` for all phases.
5. Commit.

---

## 4. Phase W1 — Shell: tokens, fonts, header, footer, transitions

1. Global CSS tokens (Section 1), fonts via `next/font`, static grain, page glow.
2. **Header:** fixed, 60px tall, transparent at top and frosted (`color-mix` 90% bg + `blur(10px)` + hairline bottom border) after 30px of scroll. Contents: the name (Bodoni, links home) on the left, "Available early 2027" with a bronze dot on the right. Nothing else.
3. **Back pill** on every inner page: rounded, `rgba(232,234,237,.06)` background, "Home" (or "All work" on a project page).
4. **Footer:** name and year, live Arizona time (`America/Phoenix`, updates every 20 s), and nothing claiming it is a draft.
5. **Scroll progress:** 1px bronze-metal line at the very top, scaleX from scroll position.
6. **Page transitions:** old page fades out over 260 ms; new page enters over 800 ms from 14px below with the easing token. Use the View Transitions API on route change where supported, otherwise a CSS fallback. Focus moves to the new page's `h1`; scroll resets to top. Reduced motion: instant.
7. **Custom cursor** (desktop with fine pointer only, never under reduced motion): a 34px bronze ring that follows with lerp 0.18 and a 5px bronze dot that follows exactly; ring grows to 58px over links and buttons; becomes an 84px solid bronze disc labelled "Open" over the front catalogue card and "Drag" over the rest of the catalogue stage. The native cursor stays available for text fields. Reset the label on route change.
8. **Magnetic buttons:** arrow buttons, back pills and main buttons move up to 25% of the pointer offset toward the pointer and spring back on leave.
9. Smooth scrolling with Lenis (lerp 0.09), off under reduced motion.
10. Commit.

---

## 5. Phase W2 — Home (the hub)

Match the reference's home exactly.

1. **Headline:** "I build the / data layer, and the / AI on top of it." in Bodoni, three lines that rise from masks on first load with 90 ms stagger. Lines must not wrap mid-line on desktop; each line wrapper has enough bottom padding that descenders (y, p) are never clipped.
2. **Lede:** the reference copy (education, 10 million records a day, offline LLM systems in production), facts checked against `portfolio-facts`.
3. **Now line:** pulsing green dot + "Now running Surplus AI in production at ASU Surplus".
4. **Ask entry:** a small text link under the now line, "Ask about my work", that opens the existing Ask panel (restyled in the shell's look). Ask stays reachable from ⌘K / Ctrl+K as before.
5. **Four tiles** (Work, Experience, About, Contact) as rounded spotlight panels: a soft bronze radial light follows the cursor inside the hovered tile (CSS variables updated on pointermove, hidden when not hovered), 4px lift and bronze border on hover, an arrow circle that turns 45°. Each tile has a bronze hint line ("4 featured, 6 more", "Celebal, ASU Surplus", "M.S., Arizona State", "Open to roles in 2027") and a one-line description, all from data.
6. **Dot field** (2D canvas, client component) to the right of the headline on desktop and above it on phones:
   - Idle shape: three streams converging into a ring with a short output line (the pipeline). Hover or focus a tile and the dots spring into that tile's shape: overlapping plates (Work), timeline bars with a milestone diamond (Experience), head and shoulders (About), envelope (Contact). Leaving the tiles returns to idle. Port the shape functions from the reference.
   - Physics: per-dot spring toward target (k 0.018–0.048), damping 0.86, gentle sine wobble, cursor repulsion within 60px.
   - Colors: steel-white dots `rgba(214,224,236,.6)` and ~18% bronze dots with a glow.
   - Performance (required): pre-render one glow sprite per color and draw with `drawImage`; 1100 dots on desktop, 700 under 700px wide; device pixel ratio capped at 2; stop full-rate updates once total velocity is ~0 and redraw at ~12 fps for the wobble; wake on tile hover or cursor proximity; pause when off screen, on hidden tabs and on other routes. Reduced motion: draw the final shape once, no animation.
7. **Fit the screen:** at 1280×720, 1366×768, 1440×900 and 1920×1080 the headline, lede, now line, dots and all four tiles fit in one viewport with no horizontal overflow (use the reference's `clamp()` values and its `max-height: 820px` tightening). On phones the page scrolls naturally; tiles are a 2×2 grid.
8. Commit.

---

## 6. Phase W3 — Work (catalogue and list)

1. **Header area:** back pill, "Work" title, one-line intro, and a segmented toggle (Catalogue / List) whose white highlight slides between the options.
2. **Data:** all ten projects from the graph. Featured four (Surplus AI, Label Lens, Cooked/DevHacks × Cubbie, Supply Chain Watchtower) carry: kicker, key number with sublabel, one-line description, 2–4 tags, art. The other six carry a description and tags from real data. Use the reference's descriptions for the featured three where they match `portfolio-facts`; write the Watchtower and the smaller projects' lines from the existing case-study content.
3. **Catalogue:** a stage inside the page margins (no cards cut off at the screen edges), rounded 32px, height `clamp(320px, 100svh − 460px, 620px)` so the stage and its controls fit on screen. One full-width card at a time; cards slide in and out within the stage and **loop endlessly** (after the last comes the first; a card that wraps around jumps without animating). Controls: "2 of 4" counter, progress pills (active pill stretches and turns bronze), round previous/next buttons. Input: drag/swipe (60px threshold), horizontal trackpad scroll (one card per gesture), arrow keys when the stage is focused. Clicking the front card opens its project; clicking a side card brings it to the front. Card layout from the reference: kicker top left, key number top right, big name bottom left, description + tags + "Open the project" bottom right.
4. **List:** rounded rows with a thumbnail of the art, name + kicker, description + tags, and the key number in the metal gradient. The six smaller projects follow the four featured.
5. **Morph between views:** switching Catalogue ⇄ List uses the View Transitions API with a shared name per project (row, art and name each get their own name) so each card glides and shrinks into its row (and back), staggered 60 ms per item; the page's root does not cross-fade during the toggle. Fallback: instant switch. Reduced motion: instant.
6. **Art:** the reference's gradient plates (navy, steel, bronze) as CSS, one per featured project. Real screenshots may be used on the project page (Label Lens), not on the catalogue cards.
7. Commit.

**STOP (G5).** Screenshot home (idle + each hover), catalogue, a mid-morph frame and list at 390×844, 1280×720 and 1440×900 next to the matching reference shots in `docs/v4/compare/`. Write in DECISIONS: "Home and Work are built. Compare `docs/v4/compare/` or run the site, then reply `approve` or list changes." Apply changes, then continue without further stops until G1.

---

## 7. Phase W4 — Project pages (`/work/[slug]`)

Template from the reference, filled from the graph:

1. Back pill "All work".
2. **Band:** the project's art, 28px radius, kicker and big name over a bottom gradient.
3. **Results:** up to three rounded tiles, each a metal-gradient number with a one-line label.
4. **What it does:** two-column section, bullets from highlights.
5. **How it's built:** the v3 architecture diagram for that project, restyled in the new tokens (thin steel lines, bronze for data flow, draws on scroll, static under reduced motion), with title, description and caption.
6. Stack as pills; links as buttons (live app, repos).
7. **Next project:** large Bodoni name with "Next project" label, looping through the featured four.
8. DevHacks × Cubbie keeps its three sub-sections (Cooked, Receipts, Bailout). Smaller projects use a compact version (no band art; just title, description, tags, details).
9. Run `fact-checker` over all project pages. Commit.

---

## 8. Phase W5 — Experience (timeline)

1. Back pill, "Experience" title, one-line intro.
2. **Timeline chart** in a rounded panel: year axis 2023–2027, one lane per role (Celebal intern, Celebal associate, ASU Surplus) plus a Milestones lane (DevHacks win as a diamond), a "Today" line labelled under the axis. Bars are bronze outlines with a soft fill; selected or hovered bars fill solid bronze. Narrow bars get their label outside the bar (right for the intern bar, left for ASU Surplus and the milestone) so nothing is truncated. Bars are buttons with `aria-expanded`.
3. **Detail panel** under the chart (live region): dates, role title in Bodoni, organisation in bronze, bullets from the graph. Opens on the current role by default.
4. Add any other role or education period only if the graph has real dates for it.
5. Phones: the chart scrolls sideways inside its panel (min width 700px); the detail stacks.
6. Commit.

---

## 9. Phase W6 — About and Contact

**About:** back pill, title, a sticky rounded portrait frame on desktop (uses `public/images/portrait.jpg` when present; until then the reference's outline placeholder, and the slot is listed in DECISIONS), the statement in Bodoni ("I like systems that hold up on a bad day…" from the reference, facts-checked), two short paragraphs, then a facts grid: Education, Certification, Data, AI and apps, from data.

**Contact:** back pill, title, intro, the email in large Bodoni with an underline that draws on hover, a rounded composer ("Write a note" textarea + "Copy email" + "Open in my email app", which builds a `mailto:` with subject "Role for a data or AI engineer" and the note as body), then GitHub, LinkedIn and Resume (PDF) links from data. Add the Ask entry here too.

Commit.

---

## 10. Motion rules (put in `motion-system`)

- One easing token; entrances 800 ms; hovers 300–600 ms; toggles and morphs 800 ms; fades 260 ms.
- Only `transform` and `opacity` animate (plus `width` on progress pills and the segmented highlight).
- The dot field is the only ambient motion on the site; everything else answers a person's action.
- Everything has a reduced-motion path: instant transitions, static dots, no cursor, no magnetic, no hero line reveal.

---

## 11. Phase W7 — Integrate and clean up

1. `/cv` keeps its content, adopts the tokens on screen, prints black on white on one page.
2. 404: the game restyled in the tokens (bronze paddle, steel records), with a back pill.
3. ⌘K / Ctrl+K palette and Ask panel restyled (rounded 28px panel, frosted header only).
4. Remove v3 visuals that are no longer used (3D scenes, posters pipeline, particle hero, physics demos, `/lab` leftovers) and their dependencies. Before deleting, confirm in `docs/v4/IA.md` that every piece of content they carried appears on a v4 route.
5. Update tests: delete tests for removed visuals, add tests for the new views (catalogue loop, keyboard, toggle, timeline selection, composer mailto, reduced motion).
6. Commit.

---

## 12. Phase W8 — QA

- **Visual comparison:** re-shoot every view at the four viewports and place each next to its reference shot in `docs/v4/compare/`. Fix differences that are not intentional (real data replacing placeholders is intentional).
- **Fit:** Playwright assertions that `scrollWidth === innerWidth` on every route at 360, 390, 768, 1024×768, 1280×720, 1366×768, 1440×900, 1920×1080; the home tiles' bottom ≤ viewport height at the desktop sizes; the catalogue stage and its controls within the viewport at 1280×720 and up.
- **Performance:** Lighthouse mobile and desktop (median of 3) against Section 2; a Performance-panel trace of 5 seconds of tile hovering on the home page with no dropped-frame clusters; bundle sizes before/after removing 3D and GSAP.
- **Accessibility:** axe zero violations on every route; full keyboard pass (tiles, catalogue arrows, toggle, timeline bars, composer); reduced-motion run of every route.
- **Browsers:** Chromium, WebKit (desktop and iPhone), and Firefox if it launches (the catalogue ⇄ list morph falls back to an instant switch there).
- Run `fe-reviewer`, `fact-checker`, `recruiter-eyes`; fix findings. Commit.

---

## 13. Phase W9 — Ship (Gate G1)

Lint, typecheck, production build with `NEXT_PUBLIC_BASE_PATH=/srujan-portfolio`, `npm run release:check`, serve at `localhost:4000/srujan-portfolio/` and click through every route; tag the current `main` as `v3-before-v4` (or `v2-before-v4` if v3 was never merged); **STOP**: "Ready to merge `redesign/v4`. Reply `merge`." After approval: merge, push, deploy with the existing mechanism, verify every route and asset live, record live Lighthouse in NOTES.

---

## 14. What Srujan does

1. Put the reference file in the repo (Section 3.1).
2. Reply `approve` (or changes) at the G5 checkpoint.
3. Optionally add `public/images/portrait.jpg`.
4. Reply `merge` at the end, then check the live site on phone and laptop.
