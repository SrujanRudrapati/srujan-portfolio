# Portfolio v3 Runbook — concept, pages, and scroll feel (for Claude Code)

**Owner:** Srujan Rudrapati · **Email:** rudrapati.srujan@gmail.com
**Repo:** srujan-portfolio · **Base:** the finished `redesign/v2` work (graph, lenses, Ask, facts, tests)
**Date:** 2026-10-30

Claude Code: this runbook extends `docs/REDESIGN_RUNBOOK.md`. Every operating rule there still applies (no invented facts, never delete content without asking, static export for GitHub Pages, evidence per phase, STATUS ledger, DECISIONS file, gates) except where this file explicitly changes one. Read both, then execute this file from its first incomplete phase.

Start command:

```
claude "Read docs/REDESIGN_V3_RUNBOOK.md and docs/REDESIGN_RUNBOOK.md, then execute the v3 runbook from the first phase docs/REDESIGN_V3_STATUS.md marks incomplete."
```

---

## 0. Why v3 exists

Srujan's feedback on v2: the design is clean but everything sits on one long page; you either scroll through all of it or click lens buttons, and that feels basic. He wants a site with a unique concept, minimal but visually striking, where scrolling itself feels interactive and smooth. References he chose:

- https://eddy-naboulet.dev/ — the whole site is a fake OS (boot screen, numbered "volumes", ⌘K command palette, keyboard shortcuts, CV as a `git log`), a separate case-study page per project; GSAP, Lenis, Three.js.
- https://mijobello.com/ — clean, typography-led developer portfolio.
- https://cartooneast.in/
- https://www.russellnumo.nl/ — creative-developer portfolio built on two colors (white, near-black).

What v3 must achieve:
1. **One concept** that belongs to a data/AI engineer, carried through layout, motion, copy, and details. Not a theme on a template.
2. **A short home page** (about 4–5 screens) that tells the story and hands off to real pages. No more "everything on one page".
3. **Scroll as the interaction**: smooth inertial scroll, scroll-scrubbed animation, pinned sequences, text that reveals as you read, numbers that count up as they arrive.
4. **Minimal palette and big type**: at most two neutrals plus one accent; one display face, one mono.
5. Recruiters still get what they need in 30 seconds (Recruiter mode at `/cv`, resume one click away from every page).

---

## 1. Rule changes for v3

- **Branch:** `redesign/v3`, created from `main` if `redesign/v2` has been merged, otherwise from `redesign/v2`.
- **Status:** `docs/REDESIGN_V3_STATUS.md` (same format as v2).
- **Dependencies (replaces v2 rule 8):** allowed additions are `gsap` (core, ScrollTrigger, SplitText, Flip; all GSAP plugins are free to use; confirm the current license on gsap.com and note it in STATUS) and `lenis` (smooth scroll). Optional, only with a reason in STATUS: `ogl` or `three` for a single WebGL moment, lazy-loaded and skipped on low-power devices. **Superseded by Phase V1.5:** `three`, `@react-three/fiber`, `@react-three/drei`, one physics engine (`@react-three/rapier` or `cannon-es`) and `@react-three/postprocessing` are allowed, code-split and loaded after first paint, with posters for low-power devices. Everything else still needs a reason. No UI kits.
- **Performance targets (replaces v2 Phase 9 targets):** Lighthouse mobile Performance ≥ 85 and desktop ≥ 95; Accessibility ≥ 95; CLS < 0.05; home page JS ≤ 180 kB gzip; no long task > 200 ms after load.
- **Reduced motion is a full alternate mode, not an afterthought:** under `prefers-reduced-motion: reduce`, Lenis is off (native scroll), nothing is pinned or scrubbed, content renders in its final state, and page transitions are instant cross-fades of ≤ 150 ms.
- **References are inspiration, never source.** Do not copy code, assets, images, fonts, copy, or a distinctive layout one-to-one from any reference site. Take principles only.
- **New gate G4:** the concept pick in Phase V1. Stop and wait for Srujan's answer.

Gates now: G1 merge to main · G2 deleting content · G3 secrets/accounts · G4 concept pick (answered: DECISIONS 11).

---

## 2. Phase V0 — Reference teardown (no site changes)

Use the `webapp-testing` skill (Playwright) to study the four reference sites. For each one:

1. Load it at 1440×900 and 390×844. Screenshot the first screen, then scroll in steps of one viewport height, screenshot each step, and save to `docs/v3/refs/<site>/`. Record a short scroll video if Playwright allows it.
2. Note in `docs/v3/REFERENCES.md`, one section per site: the concept or metaphor, page structure (which pages exist, what the home does), navigation model, type (families, sizes, how big the display type gets), palette (count the colors), scroll behavior (smooth/inertial? pinned sections? horizontal sequences? scrubbed animations?), page transitions, micro-interactions (cursor, hover, magnetic buttons, counters, sound), loading/boot screen, and what it does on mobile.
3. If a site fails to load or blocks automation, say so and move on.

End with a section "What to borrow as principles" (8–12 bullets) and "What to avoid" (things that would hurt a recruiter or performance: long blocking preloaders, scroll-jacking that fights the user, unreadable tiny mono text, sound on by default).

Load `frontend-design` before writing the takeaways. Commit. No gate.

---

## 3. Phase V1 — Three concepts, three prototypes (Gate G4)

Load `frontend-design`, `portfolio-facts`, `design-direction`.

Propose three concepts that come from Srujan's actual work, not generic "tech". Build each as a throwaway motion prototype at `/lab/a`, `/lab/b`, `/lab/c`: the hero, one scroll-driven sequence, and one project teaser, using real facts. Each prototype must actually scroll and animate; static mockups do not count.

Starting points (you may replace any of them with something better from V0, but keep three that differ in feel):

- **A. The Pipeline.** The site is a data pipeline and scrolling moves you through it. Home stages: `ingest` (who he is), `transform` (what he builds; a pinned horizontal reel of projects), `serve` (proof: metrics count up as they arrive), `query` (Ask + contact). A single thin line runs down the whole page as the data path; dots travel along it as you scroll, scrubbed to scroll position, and the bronze → silver → gold → LLM medallion builds itself in the hero. Mono labels like `stage 02 / transform`. Feels: precise, engineered, calm.
- **B. The Notebook.** The site is a running data notebook: numbered cells (`In [1]`, `Out [1]`) that execute as they scroll into view; outputs render as small charts, tables, and diagrams; project pages are notebooks with Problem / Approach / Results cells. ⌘K opens a "kernel" command palette (navigate, Ask, theme, resume). Feels: playful, nerdy, honest about the work.
- **C. The Spec Sheet.** Editorial and typographic, like an engineering datasheet: oversized display type, a strict grid, hairline rules, figure numbers (`fig. 03`), big impact numbers as the visual. Scroll reveals lines of type and draws rules and diagrams. Almost no color. Feels: confident, minimal, closest to Russell Numo and mijobello in spirit.

For each concept write in `docs/v3/CONCEPTS.md`: one-line pitch, palette (hex, light and dark), display + mono font pairing with weights, motion signature (the one movement people will remember), home page outline screen by screen, how a project page looks, how Ask and the lenses fit in, the recruiter path, the mobile approach, and one risk.

Take screenshots and a 10-second scroll video per prototype (Playwright) into `docs/v3/concepts/`.

**STOP (G4).** Write in DECISIONS.md: "Pick a concept: A, B, C, or a mix (for example: A's structure with C's typography). Your recommended default is X because …". Wait for the answer. Record the pick and any tweaks in `design-direction` (update that skill) before continuing.

---

## 3a. Phase V1.5 — Visual layer: realistic 3D and physics

Added 2026-10-30 after G4 (DECISIONS 11). Srujan's feedback on the prototypes: they feel too bare. This phase adds a realistic 3D and physics layer to the chosen concept (A's structure, C's typography, blue accent) and every later phase builds on it.

**Skills (load for all 3D work, in this and every later phase):** `threejs-core-renderer`, `threejs-syntax-materials`, `threejs-syntax-loaders`, `threejs-impl-lighting`, `threejs-impl-shadows`, `threejs-impl-post-processing`, `threejs-impl-physics`, `threejs-impl-react-three-fiber`, `threejs-impl-drei`, `threejs-errors-performance`, `threejs-errors-rendering`, `threejs-agents-model-optimizer` (third party, MIT, from github.com/Impertio-Studio/Three.js-Claude-Skill-Package; audit in STATUS), plus `frontend-design`, `motion-system`, `portfolio-facts`.

**Stack.** `three`, `@react-three/fiber`, `@react-three/drei`, physics with `@react-three/rapier` or `cannon-es` if Rapier's size breaks the budget (measure and justify in STATUS), `@react-three/postprocessing` for AO, depth of field and bloom. Exact versions, at least two weeks old. All 3D code is code-split and loaded after first paint; the initial page JS budget does not change.

**Realism.**
- Physically based materials with real textures (wood, cardboard, brushed aluminium, glass, plastic, paper labels) from CC0 sources only (Poly Haven, ambientCG). Models are CC0 or built in code. No brand logos or trademarks (no Apple, Discord, Canvas, F1 team liveries). Every asset's source and license in `docs/v3/ASSETS.md`.
- Image-based lighting from a CC0 HDRI (1k, compressed), ACES or AgX tone mapping, soft contact shadows, ambient occlusion, subtle depth of field and bloom only where they help. Textures compressed (KTX2), models Draco or meshopt compressed. Decoders and transcoders are self-hosted under `public/`; never a third-party CDN (static export, no outside requests).
- Real rigid-body physics: gravity, collisions, friction, restitution. Motion feels physically true, not keyframed.

**Scenes** (visual metaphors only; no numbers or claims beyond `portfolio-facts`):
- **Hero:** a particle data stream under real forces. Particles fall under gravity as raw noise (bronze), are pulled into lanes by a field (silver), glow (gold), and condense into the headline (LLM). Scroll drives it; the cursor is a gentle force on desktop.
- **Surplus AI:** jumbled cardboard boxes and electronics ride a roller conveyor through four compact aluminium compute units, come out aligned, and drop onto a wooden pallet where they collide and settle. Click an item to flick it.
- **DevHacks × Cubbie:** Cooked: week blocks drop into a calendar and a 0 to 100 gauge needle settles with spring physics. Receipts: 493 tiles flip in a domino wave. Bailout: chore tokens slide between two rooms through an approval gate.
- **Label Lens:** a realistic medicine bottle turns, a scan line passes, and words peel off the label and stack into a warning column.
- **Supply Chain Watchtower:** a watchtower beacon over a terrain of nodes with pulses travelling along edges.
- **Kubernetes:** pods as cubes that spawn, fall into node trays and rebalance. **CI/CD:** blocks moving through build, test, deploy gates. **F1 predictor:** a generic open-wheel car tracing a ribbon track. **WLAN toolkit:** wave rings across access points. **Java chat app:** message bubbles dropping and stacking. **Hand Gesture RC Car:** a small RC car that tilts and steers as a hand-tilt arrow above it moves (rigid-body vehicle). **Capstone and others:** an abstract physical scene from that project's graph data.
- Real screenshots replace a scene where they exist (capture the Label Lens live app with Playwright).

**Mini-game "Clean the pipeline":** physics-based. Bad records (duplicates, nulls, malformed rows) fall and bounce through bronze, silver and gold; the player catches them before gold. Score, three lives, keyboard and touch. Lives on the 404 page and in the command palette. No autoplay sound.

**Performance rules.**
- ONE shared WebGL canvas for all covers (drei `View` or scissor rendering).
- Only scenes on screen simulate and render; physics sleeps when settled.
- A static poster image of each scene is rendered ahead of the build and shown first, under reduced motion, on low-power devices, and if WebGL fails.
- Fewer particles and lower resolution on mobile.
- At most about 1.5 MB of 3D assets per page; initial page JS budget unchanged; 60 fps on a mid-range laptop.

**Photo slots.** Leave slots in `public/images/` for a portrait, the hackathon, and the Surplus Station setup; list them in DECISIONS.

**Deliverable for this phase.** `/lab/a` updated with the physics hero and the Surplus AI and Label Lens covers; screenshots and a scroll video in `docs/v3/visual/`; `docs/v3/ASSETS.md`. No gate: continue to V2.

---

## 4. Phase V2 — Motion foundation

Load `frontend-design`, `design-direction`, `static-export-check`.

1. **Write a new project skill `motion-system`** (`.claude/skills/motion-system/SKILL.md`, use `skill-creator`) containing the rules below, plus the chosen concept's motion signature. Description: "Load whenever adding or changing any animation, scroll effect, transition, or interaction."
2. **Smooth scroll:** a `SmoothScroll` provider with Lenis (lerp around 0.1, touch smoothing off so mobile keeps native momentum), driven by GSAP's ticker, synced with ScrollTrigger. Anchor links and the keyboard (Space, PageDown, arrows, Home/End) must still work. Off under reduced motion.
3. **Primitives** (client components, all SSR-safe for static export, all with a reduced-motion branch):
   - `SplitReveal`: headings split into lines/words with SplitText, masked slide-up on enter; screen readers get the unsplit text (`aria-label` on the wrapper, split pieces `aria-hidden`).
   - `ScrubTimeline`: a GSAP timeline tied to a section's scroll range.
   - `Pin`: pins a section for N viewport heights; never on screens under 768 px wide unless the concept requires it and it's tested.
   - `HorizontalReel`: vertical scroll drives horizontal movement of a track; on mobile it becomes a native horizontal swipe with scroll-snap.
   - `CountUp`: numbers count to their value when they enter; the final text is in the HTML from the start (no layout shift, crawlers and screen readers see the real number). Approximate values keep their `~`.
   - `Magnetic`: buttons pull slightly toward the pointer (desktop, `pointer: fine` only).
   - `Cursor`: optional custom cursor that grows over links and shows a short label over project cards ("open"); desktop only; the native cursor stays available to assistive tech; off under reduced motion.
4. **Page transitions:** between routes, a short (≤ 600 ms) transition in the concept's language (for the Pipeline: the data line sweeps across; for Notebook: a cell "executes"; for Spec Sheet: a rule wipes). Use the View Transitions API where supported with a GSAP fallback; focus moves to the new page's `h1`; scroll resets to top; no transition under reduced motion beyond a ≤ 150 ms fade.
5. **Intro:** at most 1.2 s, first visit of the session only, skippable by any key or click, never blocks content for crawlers (content is in the HTML underneath). Skip it entirely under reduced motion.
6. **Rules** (put them in `motion-system`): animate only `transform`, `opacity`, `clip-path`, and SVG stroke; one easing family (for example `power3.out` for entrances, `none` for scrubs); entrances 500–900 ms; hovers 150–250 ms; nothing loops forever except the concept's ambient element, and it pauses offscreen and when the tab is hidden; kill every ScrollTrigger on route change (no leaks; check with a Playwright test that navigates back and forth 10 times and counts triggers).

7. **3D in the motion system (V1.5):** the shared canvas and its `View` slots, poster-first loading, the low-power and WebGL-failure fallbacks, and "simulate only on screen, sleep when settled" are part of the motion foundation; `motion-system` documents them next to the GSAP rules, and the route-change leak test also counts live WebGL views and physics worlds.

First step of V2: remove `/lab/b` and `/lab/c` (DECISIONS 11). Demo every primitive at `/lab/motion`. Commit.

---

## 5. Phase V3 — Information architecture and routing

The fix for "too much on one page". Load `static-export-check`, `portfolio-facts`.

New routes (all statically exported; dynamic routes use `generateStaticParams` from the graph):

| Route | Purpose |
|---|---|
| `/` | Short scroll story in the chosen concept (4–5 screens), ends at contact |
| `/work` | Index of all projects: featured large, others compact; filterable |
| `/work/[slug]` | One case study per project (all featured ones get full pages; other projects get a shorter page) |
| `/explore` | The v2 lenses (Timeline, Skill map, By problem, By industry), restyled |
| `/cv` | Recruiter mode one-pager, printable to one page, with the resume download |
| `/about` | Short bio, how he works, education and certifications |
| 404 | A small on-concept page (Pipeline: `row not found` with a query; Notebook: a `KeyError` cell) with links home |

Navigation:
- A minimal persistent nav: name/mark, Work, Explore, About, CV, and a ⌘K / Ctrl+K hint. Current page marked with `aria-current="page"`.
- **Command palette (⌘K / Ctrl+K, also a visible button for touch):** jump to any page or project, run Ask (the v2 Ask Srujan feature lives here now, plus a small entry point on the home page), toggle theme, copy email, open resume. Fully keyboard operable; a dialog with focus trap and Escape to close; announced to screen readers.
- Number keys `1`–`4` jump to the main pages (ignored while typing in an input).
- Resume link reachable from every page in one click.
- The palette also launches the "Clean the pipeline" mini-game (V1.5); the 404 page hosts it too.

Move content, do not delete it: everything that was on the v2 single page must exist on one of these routes. Write a mapping table (old section → new route) into `docs/v3/IA.md` and check every item off. Anything you think should be cut goes to DECISIONS.md (G2).

Fix all internal links and anchors, including Ask evidence links (they now point to `/work/[slug]#…` or `/explore#…`). Update `graph.json` evidence URLs and the build validation accordingly. Commit.

---

## 6. Phase V4 — The home page story

Load `frontend-design`, `design-direction`, `motion-system`, `portfolio-facts`.

Build `/` in the chosen concept, about 4–5 screens, each with one job:

1. **Hero:** name, the line "I build the data layer, and the AI on top of it." (or the variant he approved), the V1.5 physics particle stream as the signature moment (poster first, scroll-driven, cursor force on desktop), and a quiet scroll cue. Resume and contact visible.
2. **What I do:** two or three short statements revealed line by line, tied to real facts.
3. **Selected work:** the four featured projects (Surplus AI, DevHacks × Cubbie, Label Lens, Supply Chain Watchtower) as a pinned or horizontal sequence; each panel leads with one big impact number (`CountUp`), a one-liner, its V1.5 3D cover (or a real screenshot where one exists), and "open case study". Link to `/work` for the rest.
4. **Proof strip:** three to five metrics from the facts, counting up as they arrive.
5. **Ask + contact:** a single input "Ask about my work" (opens the palette in Ask mode), the email, GitHub, LinkedIn, resume.

Everything on the home page is a teaser; depth lives on the other pages. Run `recruiter-eyes` on the home screenshots: can a recruiter tell who, what, proof, and contact within the first two screens? Fix until yes. Commit.

---

## 7. Phase V5 — Case study pages

Load `frontend-design`, `motion-system`, `portfolio-facts`.

Template for `/work/[slug]`, filled from the graph (no new facts):

1. Title, status badge, one-liner, role/context/date, links (live, repo), and the project's V1.5 3D cover scene (poster first; real screenshot where one exists).
2. **Impact first:** the metrics, large.
3. **Problem → approach:** short sections from the project's highlights and problem nodes.
4. **Architecture:** the project's diagram drawn by scroll (`ScrubTimeline`: stroke draws, stages light in order, data dots move with scroll position). Static, fully drawn under reduced motion. `<title>`, `<desc>`, caption.
5. **Stack** and **what I'd do next** (only if a fact supports it; otherwise omit).
6. **Next project** at the bottom: a large link to the following case study with a hover preview, so visitors keep moving through the work.

DevHacks × Cubbie gets one page with three sub-sections (Cooked, Receipts, Bailout). Shorter projects (WLAN toolkit, F1 predictor, RC Car, etc.) use a compact version of the template. Run `fact-checker` over every page's rendered text. Commit.

---

## 8. Phase V6 — Secondary pages in the concept

Load `frontend-design`, `design-direction`, `motion-system`.

Restyle `/work` index (covers rendered through the one shared canvas), `/explore` (lenses keep their logic; their switching gets a Flip transition instead of an instant swap), `/about`, `/cv` (stays plain and printable, but typographically in the concept), and the 404 (with the "Clean the pipeline" game). Make sure the Ask results panel inside the palette uses the concept's style and still shows sources. Commit.

---

## 9. Phase V7 — Polish, mobile, performance, accessibility

Load `webapp-testing`, `static-export-check`, `motion-system`, `phase-verify`.

- **Mobile (390 and 360 wide, real touch emulation):** no pinned sequence that traps the thumb; horizontal reels become swipeable with snap; no custom cursor; tap targets ≥ 44 px; the command palette opens from a visible button.
- **Safari and Firefox:** run the Playwright suite in WebKit and Firefox as well as Chromium; fix any scroll or transition differences.
- **Performance:** code-split GSAP plugins per route; lazy-load all WebGL after first paint; check every page's 3D assets against the 1.5 MB budget, one canvas per page, posters present for every scene, and the WebGL-off, low-power and reduced-motion fallbacks; measure fps on the home hero and one physics cover; preload the display font; images as AVIF/WebP with explicit sizes; measure home JS size and Lighthouse (mobile and desktop, median of 3) against the targets in Section 1.
- **Accessibility:** axe zero violations on every route; full keyboard pass including the palette; screen-reader check that split text reads as normal sentences; reduced-motion pass on every page (record a Playwright run with `reducedMotion: 'reduce'`).
- **Feel check:** record a 20-second scroll video of the home page and one case study at 1440 and 390, save in `docs/v3/final/`. Scroll should never stutter: check the Performance panel for dropped frames during the pinned sequence and fix the worst offender.
- Run `fe-reviewer`, `fact-checker`, `recruiter-eyes`; fix findings. Remove `/lab/*` routes (pre-approved). Commit.

---

## 10. Phase V8 — Ship (Gate G1)

Same as v2 Phase 11: lint, typecheck, production build, serve at `localhost:4000/srujan-portfolio/` and smoke-test every route; tag the current `main` as `v2-before-v3`; **STOP** and write "Ready to merge `redesign/v3`. Reply `merge`." in DECISIONS.md; after approval merge, push, deploy with the existing mechanism, verify every route and asset on the live URL, record live Lighthouse in NOTES.

---

## 11. What Srujan does

- Answer **one question** at Phase V1 (which concept), then later reply `merge`.
- At the end, open the live site on phone and laptop, scroll the home page slowly, open two case studies, press ⌘K, and try one Ask question.
