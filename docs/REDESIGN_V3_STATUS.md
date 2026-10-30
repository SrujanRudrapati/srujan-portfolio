# Redesign v3 status

Ledger for `docs/REDESIGN_V3_RUNBOOK.md` (same format as `docs/REDESIGN_STATUS.md`). One row per phase. Rulings are listed under the phase that made them. Branch `redesign/v3`, created from `main` at ecfa9fc (v2 was merged in 9dc7e7c). Last updated 2026-10-30.

| Phase | Status | Commit | Notes |
|---|---|---|---|
| V0 — Reference teardown | done | `redesign: phase V0 — reference teardown` | All four sites captured at 1440 and 390 (9 steps each plus interaction passes); `docs/v3/REFERENCES.md` with one section per site, 11 principles to borrow, 9 things to avoid. Checklist below. |
| V1 — Three concepts, prototypes (G4) | done (G4 answered 2026-10-30: A's structure, C's typography, blue accent) | `redesign: phase V1 — three concept prototypes` | `/lab/a` Pipeline, `/lab/b` Notebook, `/lab/c` Spec Sheet, each a scrolling, animated hero + scroll sequence + project teaser from real facts; `docs/v3/CONCEPTS.md`; screenshots and scroll videos in `docs/v3/concepts/`. Recommended: A's structure with C's typography. Checklist below. |
| V1.5 — Visual layer: 3D and physics | done | `redesign: phase V1.5 — visual layer, 3D and physics` | One shared canvas, poster-first 3D: physics particle hero, Surplus AI conveyor, Label Lens bottle; CC0 KTX2 textures and gain-map HDRI (about 1.0 MB); 59.6 fps on M2; fallbacks tested in `e2e/three.spec.ts`. Checklist below. |
| V2 — Motion foundation | done | `redesign: phase V2 — motion foundation` | `/lab/b`, `/lab/c` removed; primitives in `src/components/motion/` with `MotionRoot`; demo at `/lab/motion` and `/lab/motion/next`; leak test (10 round trips) and transition, intro, keyboard, reduced-motion tests in `e2e/motion.spec.ts`. Checklist below. |
| V3 — IA and routing | todo | | |
| V4 — Home page story | todo | | |
| V5 — Case study pages | todo | | |
| V6 — Secondary pages | todo | | |
| V7 — Polish, mobile, perf, a11y | todo | | |
| V8 — Ship (G1) | todo | | |

## Phase V2 checklist

- [x] Skills loaded: `frontend-design`, `design-direction`, `static-export-check`, `motion-system` (extended with a primitives table and the transition, intro and cleanup rules).
- [x] First step: `/lab/b` and `/lab/c` removed (DECISIONS 11 is the G2 yes). `scripts/v3-concepts.mts` notes that only `/lab/a` remains.
- [x] `SmoothScroll`: Lenis (lerp 0.1, `syncTouch` off, `anchors` on) on GSAP's ticker, synced with ScrollTrigger; `lenis/dist/lenis.css` imported (it turns off the global `scroll-behavior: smooth` while Lenis drives). Keyboard scrolling checked (PageDown moves the page). Off under reduced motion.
- [x] Primitives, all SSR-safe for static export with a reduced-motion branch: `SplitReveal` (masked lines or words; screen readers get one visually hidden plain copy), `useScrubTimeline`, `Pin` (768 px and wider), `HorizontalReel` (pinned sideways scrub on desktop, swipe with snap on phones; pinned items reachable by Tab), `CountUp` (real value in the HTML and `data-count`, `~` kept), `Magnetic` (fine pointers, at most 10 px), `Cursor` (accent ring beside the native cursor, grows on links, `data-cursor` labels).
- [x] Page transitions: internal links intercepted in the capture phase (`preventDefault` only, so link handlers still run and `next/link` stands down). View Transitions API: the new page wipes in under a sweeping accent line (520 ms); otherwise a GSAP panel led by the line; reduced motion: 150 ms crossfade. Our navigations land at the top, or on the link's `#anchor`; focus moves to the anchor or `main h1`; back and forward keep the browser's scroll restoration. One transition at a time; a 4 s timeout releases a stuck one. The GitHub Pages basePath is stripped before `router.push` (unit test `PageTransitions.test.ts`).
- [x] Intro: about 1.1 s, first visit of the session, pre-paint script sets `html[data-intro]` and wires the skip (any key, click, wheel, touch), a CSS timeout hides it even without JS, never under reduced motion, content always in the HTML underneath.
- [x] 3D in the motion system (runbook V2 step 7): `MotionRoot` mounts the shared `StageHost`, so one canvas persists across routes; the leak test counts ScrollTriggers, 3D slots and canvases.
- [x] Demo of every primitive at `/lab/motion` (real figures from the graph) and `/lab/motion/next`; evidence in `docs/v3/motion/` (1440 light and dark, 390 light, reduced, scroll video; mean 58.9 fps, p95 frame 16.7 ms on the M2).
- [x] Tests: `e2e/motion.spec.ts` (10 back-and-forth navigations leave ScrollTrigger, slot and canvas counts unchanged; arrival at the top with focus on h1; leaving while a section is pinned throws nothing; a cross-page `#anchor` lands on the anchor; intro once per session and skippable; keyboard scrolling with Lenis; reduced motion starts nothing and keeps the real figures), stable over 3 repeats; `count.test.ts`, `PageTransitions.test.ts`. Full Playwright suite 166 passed, 38 project-scoped skips; unit 65 passed.
- [x] `phase-verify`: lint, typecheck, build; `npm run verify -- --phase V2 --path /lab/motion --path /lab/motion/next --path /lab/a`: 12 of 12 pass; 3D assets 1009 of 1536 KB.
- [x] Review: `react-reviewer` on the V2 diff (no critical, 4 high, 6 medium, 5 low), all fixed: basePath doubled on Pages by `router.push`; pins reverted in layout effects so a route change cannot hit a `removeChild` error; a timed-out navigation no longer counts as ours; cross-page anchors; `CountUp` cleanup and first-frame flash; no `stopPropagation` in the click interceptor; Lenis CSS; pinned reel focus; GSAP lag smoothing restored; `window.__motion` only in development or with `?motion-debug`; intro under StrictMode; overlay timeline killed on unmount; SVG anchors and `rel="external"` skipped; scrub pins desktop-only.

### Rulings made in Phase V2

- React 19.2 has no `<ViewTransition>`; the transition calls `document.startViewTransition` directly with a GSAP fallback. Revisit when React 19.3 is in use.
- `MotionRoot` is mounted in `/lab/motion/layout.tsx` for this phase; V3 moves it into the root layout with the new routes.
- `npm run verify` ignores aborted Next.js prefetches (RSC requests, and the router's own extensionless route probe that Next cancels by design); every other failed request still fails the run.
- Found while testing: Lenis keeps the previous page's scroll limit until its resize observer runs, so a cross-page anchor could stop short; arrivals call `lenis.resize()` first.

## Phase V1.5 checklist

- [x] G4 recorded: DECISIONS 11 moved to Answered; pick written into `design-direction` (new v3 section on top, v2 kept as history). Duplicate root `REDESIGN_V3_RUNBOOK.md` deleted after confirming it was byte-identical to `docs/REDESIGN_V3_RUNBOOK.md`.
- [x] Runbook: Phase V1.5 added as section 3a; dependency rule, V2 (step 7 and "remove `/lab/b`, `/lab/c` first"), V3 (palette game), V4 (hero, covers), V5 (cover per case study), V6 (`/work` covers, 404 game) and V7 (3D budget and fallbacks) amended.
- [x] Third-party skills installed (see audit below). No restart was needed: Claude Code picked up the new skill folders a few seconds after they were copied (the first `Skill` call, made immediately, failed with "Unknown skill"; the listing arrived on the next turn).
- [x] `motion-system` skill written now instead of in V2 item 1, because Srujan asked for it to be loaded for all 3D work; V2 extends it.

- [x] Skills loaded for all 3D work: the 12 `threejs-*` skills (read in full during the audit, in this session), `frontend-design`, `portfolio-facts`, `motion-system` (written this phase), `design-direction`.
- [x] Dependencies, pinned exact, each at least two weeks old: `three` 0.186.1 (0.187.0 was published the same day, so not taken), `@react-three/fiber` 9.8.2, `@react-three/drei` 10.7.9, `cannon-es` 0.20.0 (MIT, see "Physics engine" below); dev: `@types/three` 0.186.0, `ktx2-encoder` 0.6.0 (MIT, Basis Universal encoder as WASM, used only by `npm run assets:build`). Not added: `@react-three/postprocessing` (see rulings). `npm audit --omit=dev`: 0 vulnerabilities.
- [x] One shared WebGL canvas (`src/components/three/Stage3D.tsx`): fixed, transparent, click-through, one drei `View` per `SceneSlot`. drei skips off-screen Views; each scene steps its simulation only while its slot intersects the viewport (IntersectionObserver, 15% margin); a governor stops the frame loop (`frameloop="never"`) when no slot is on screen or the tab is hidden; settled bodies sleep.
- [x] Poster first: every scene has a static poster in `public/posters/` (`hero-stream`, `hero-stream-portrait` for narrow screens, `surplus-line`, `label-lens`), rendered by `npm run posters` from `/lab/posters` with the same seeded scene code, transparent so one poster serves both themes. The poster is in the server HTML; the live view fades in over it after its first frame. Reduced motion, low-power devices (`hardwareConcurrency <= 4`, `deviceMemory <= 4` or Save-Data), no WebGL 2, and a lost context all stay on the poster. Checked: under `reducedMotion: 'reduce'` no canvas is created (`scripts/v3-visual.mts` fails if one is).
- [x] Code splitting: the three/fiber/drei/cannon code sits behind a lazy boundary (`StageHost` → `Stage3D`, and one lazy chunk per scene) and loads on `requestIdleCallback` after `load`. Checked in `out/`: no initially loaded chunk of `/` or `/lab/a` contains three.js or cannon-es. Initial JS (gzip -9 of the chunks in the HTML): `/` 196 KB (unchanged by this phase; it has no 3D; V1 baseline, already over the V7 target of 180 KB), `/lab/a` 228 KB. Lazy 3D chunks: about 242 KB (three, fiber, drei parts), 56 KB and 8 KB gzip.
- [x] Assets: all CC0 (ambientCG Cardboard004, Metal051A, Wood049, Plastic010, Paper003; Poly Haven studio_small_09 HDRI) or built in code; listed with URLs, licenses and bytes in `docs/v3/ASSETS.md`. Textures KTX2 (ETC1S colour/roughness, UASTC+RDO+zstd normals); HDRI as a gain map (86 KB instead of the 1.6 MB `.hdr`); Basis transcoder self-hosted. `/lab/a` 3D assets: about 1.03 MB raw (about 0.7 MB over the wire), under the 1.5 MB budget. No glTF models, so no Draco/meshopt decoder ships.
- [x] Look: AgX tone mapping, image-based light from the HDRI, one shadow-casting key light per scene, soft contact shadows, physically based materials (amber glass with transmission, bead-blasted aluminium, cardboard, pallet wood, plastic, paper), a gold halo on modeled particles (normal blending, so it reads on white and black).
- [x] Physics, all by force: hero particles (custom integrator: gravity, bin walls with restitution 0.55 and friction, lane field, glyph springs, cursor repulsion on desktop); Surplus AI (cannon-es: roller traction limited by grip, centring force and yaw-aligning torque inside each unit, gravity, collisions on the pallet; click flicks an item); Label Lens (cannon-es: words peel with an impulse, a guiding force carries one word at a time over the column, a critically damped levelling torque, then gravity stacks them).
- [x] Tests: `src/components/three/scenes/surplus-sim.test.ts` (Vitest, Node): items reach the pallet, none falls through the floor or off the back of the belt, a seed gives identical runs. `npm run test:unit`: 60 passed.
- [x] Real screenshot: the live Label Lens app captured with Playwright (`scripts/capture-label-lens.mts`) into `public/images/projects/`, shown in the Label Lens panel as "The live app".
- [x] Photo slots: `public/images/README.md` lists `portrait.jpg`, `hackathon.jpg`, `surplus-station.jpg`; DECISIONS 12 asks for them.
- [x] `/lab/a` updated: C's typography (Archivo 800 at 62% width for the name, section titles and figures; Martian Mono for stage labels), white/black neutrals with the blue accent, the physics hero (sticky while it runs, desktop), the Surplus AI and Label Lens covers.
- [x] Evidence in `docs/v3/visual/`: 1440 light and dark and 390 light, first screen plus scroll steps; `reduced/full.jpg`; `scroll-1440.webm`; `timing.json`. Frame timing while scrolling the hero and covers on the real GPU (Apple M2, headless Chromium with ANGLE Metal): mean 59.6 fps, p95 frame 16.8 ms, 2 of 841 frames over 33 ms. No console errors.
- [x] `phase-verify`: lint, typecheck, unit tests, build; `npm run verify -- --phase V1.5 --path /lab/a --path /`: 8 of 8 pass (axe, console, overflow) in `docs/screenshots/phase-V1.5/`.

- [x] Review: `fe-reviewer` (no critical, 4 high, 7 medium, 7 low). Fixed: an error boundary around the 3D layer (a failed renderer or scene chunk now leaves posters, not an error page); the stage request is now a session-wide state that survives remounts; a lost context, a failed asset load or reduced motion turning on mid-session unmounts the canvas (posters stay); no per-step allocations in the hero loop; env and texture caches keyed per renderer with failures routed to posters; the poster fades only after live frames on screen and the loop wakes the moment a slot appears; the hero's portrait poster on phones; the tall sticky hero only when the live stream will run; the hero re-warms after a debounced resize; `@monogrid/gainmap-js` pinned as a direct dependency (3.4.0, the newest release older than two weeks; drei dedupes to it); the label texture and the hover cursor cleaned up; the hero's progress read in the frame loop instead of a separate rAF; the WebGL probe context released, and `?3d=on` no longer bypasses reduced motion or a missing WebGL; pointer leave on the document element and blur. Added `e2e/three.spec.ts` (reduced motion: no canvas and every poster visible; `?3d=off`; one canvas, then context loss falls back to posters) and a 3D byte budget in `npm run verify` (1009 KB of 1536 KB). Not changed, with reason: `/lab/posters` stays in the export until `/lab` is removed in V7 (noindex, unlinked; the poster script needs a served build); posters stay WebP only (see rulings).
- [x] Full Playwright suite: 159 passed, 24 skipped (project-scoped skips); `npm run verify -- --phase V1.5 --path /lab/a --path /`: 8 of 8 pass.

### Rulings made in Phase V1.5

- **No post-processing pass.** All covers share one scissored canvas; screen-space AO, depth of field and bloom would each need an off-screen render target per View every frame, which breaks the 60 fps target with several covers on screen and fights the transparent canvas. Ambient occlusion is approximated by contact shadows under every object plus the key light's soft shadows; bloom is used in one place, as a halo on the gold particles; depth of field is not used. `@react-three/postprocessing` is therefore not installed. If Srujan wants true SSAO on the case-study covers (one cover per screen), V7 can add it there.
- **Posters are rendered ahead of the build and committed**, not by CI: GitHub's runners have no GPU, and SwiftShader renders differ. `npm run posters` against a local build (`npx serve out -l 4321`) regenerates them; V7 adds a build check that every scene has a poster.
- **WebP only for posters** (Chromium's canvas encoder writes WebP with alpha; AVIF has no canvas encoder). `motion-system` updated.
- **cannon-es quirks found and handled** (reproduced in isolation): `applyForce`'s point is body-relative (passing world positions added large spurious torque); a small non-zero contact friction behaved like 0.3, so the conveyor bed uses zero friction plus a separate traction force; `linearDamping` let a flat brick sink through a static box, so the word bricks have none; sleeping bodies get no contacts, so items on the belt are kept awake.
- **Aluminium ships roughness only**: the ambientCG albedo read as dark speckle and the circular-brush normals as cracks at cover size.
- **Label Lens keeps its 3D cover** (Srujan specified the scene); the real app screenshot sits under it in the panel and will lead the case study.
- **Label text on the bottle is a generic prop** ("Contains lactose", "May cause drowsiness", …), not a real product; it stands for the rule that every warning quotes the label (portfolio-facts 2.3) and makes no claim.
- **The shared dev server's server bundle went stale** during the phase (hydration kept old attributes). It was not restarted (it was not started by Claude); evidence was produced from production builds served on :4321 instead.
- `npm run verify` now ignores one known third-party warning, "THREE.Clock: This module has been deprecated" (fiber 9.8.2 still creates a Clock); everything else still fails the run.
- `public/three/**` (vendored transcoder) is excluded from ESLint.

### Third-party skills: source, license, audit

- **Source:** https://github.com/Impertio-Studio/Three.js-Claude-Skill-Package (its `package.json` names the upstream as OpenAEC-Foundation/Three.js-Claude-Skill-Package), shallow clone of commit `6c190f0db95d6e4b77d7843d181c6d3325c09d0e` (2026-03-30), cloned to `/tmp/threejs-skills`.
- **License:** MIT, Copyright (c) 2026 OpenAEC Foundation. The license file is copied into each installed skill folder.
- **Installed (12):** `threejs-core-renderer`, `threejs-syntax-materials`, `threejs-syntax-loaders`, `threejs-impl-lighting`, `threejs-impl-shadows`, `threejs-impl-post-processing`, `threejs-impl-physics`, `threejs-impl-react-three-fiber`, `threejs-impl-drei`, `threejs-errors-performance`, `threejs-errors-rendering`, `threejs-agents-model-optimizer`. Each is `SKILL.md` plus `references/{methods,examples,anti-patterns}.md`; the 12 others in the package were not copied.
- **Audit:** every `SKILL.md` read in full; all files grepped for URLs, shell commands and instruction-like text. The repo has no scripts at all (no `.sh`, `.py`, `.js`, `.mjs`, `.ts`), no hooks, and no `allowed-tools` frontmatter. Nothing runs by itself. Things to know:
  - **Commands in examples:** `threejs-agents-model-optimizer` documents `npx gltf-transform …` (inspect, dedup, weld, simplify, ktx2, draco, optimize), `npm install -g gltfpack` and `gltfpack -i …`; `threejs-impl-drei` shows `npm install @react-three/drei @react-three/fiber three`. These are documentation; we run none of them from the skill. `npx` would fetch packages from npm at run time, so any tool we use is added as a pinned dev dependency instead.
  - **URLs that code would fetch:** `threejs-syntax-loaders` and `threejs-agents-model-optimizer` set the Draco decoder path to `https://www.gstatic.com/draco/versioned/decoders/1.5.6/` and the KTX2 transcoder to `https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/basis/`. Copying those would make the site fetch WASM from Google and jsDelivr. We self-host both under `public/three/` instead. `threejs-impl-drei` notes that `<Environment preset=…>` downloads from a CDN; we never use presets, only our own HDRI.
  - All other URLs are documentation links (threejs.org, r3f.docs.pmnd.rs, drei.docs.pmnd.rs, rapier.rs, pmndrs GitHub, gltf-transform.dev, meshoptimizer GitHub).
  - No prompt-injection text found (no instructions to ignore rules, reveal or send data, or touch secrets).
  - Some advice is dated (Three.js r160 examples, `RGBELoader` where current three names it `HDRLoader`); the installed `three` version's own docs win where they differ.

### Physics engine: cannon-es, not Rapier

Measured from the npm tarballs (gzip -9 of the file a bundler ships): `@dimforge/rapier3d-compat` 0.19 (`rapier.mjs`, WASM inlined as base64) 2,219 KB raw / **830 KB gzip**, plus `@react-three/rapier` 2.2.0 at 15 KB gzip, so about 845 KB of physics on every page with a physics scene. `cannon-es` 0.20.0 is 346 KB raw / **75 KB gzip** unminified (less once minified). With a budget of about 1.5 MB of 3D per page that also has to hold the HDRI, textures and the KTX2 transcoder, Rapier alone would use more than half. Our scenes have at most a few dozen bodies (boxes on a conveyor, pods in trays, tokens, one raycast vehicle), well inside cannon-es's range, and cannon-es has sleeping, contact materials, constraints and `RaycastVehicle`. Rapier's strengths (thousands of bodies, determinism, full CCD) are not needed. Choice: `cannon-es`, used directly through a small hook (no `@react-three/cannon`, whose worker setup targets older fiber).

## Phase V1 checklist

- [x] Skills loaded: `frontend-design`, `portfolio-facts`, `design-direction`.
- [x] Dependencies (v3 rule): `gsap` 3.15.0 (Standard "No Charge" GSAP License, checked on gsap.com/licensing 2026-10-30: commercial use and all plugins, ScrollTrigger, SplitText and Flip included, are free; the only prohibited use is building a competing no-code animation tool) and `lenis` 1.3.27 (MIT). Both pinned exact. No WebGL library.
- [x] Three prototypes that scroll and animate, each with hero, one scroll-driven sequence and one project teaser: A pinned sideways project reel plus a scrubbed rail and record; B cells that execute on entry plus a pinned scrubbed bar chart; C a scrubbed 15-to-3 countdown pinned on desktop plus a word-by-word reading reveal.
- [x] Real facts only: every figure and sentence comes from the graph or `profile.ts` through `src/app/lab/_lib/facts.ts`, which throws if a node is missing. No new numbers, dates or claims.
- [x] Reduced motion: Lenis, pins, scrubs and entrances never start; the page renders finished (`reduced/full.png` per prototype; the capture script fails if the motion layer starts).
- [x] `docs/v3/CONCEPTS.md`: pitch, palette (light and dark hex), font pairing and weights, motion signature, home outline, project page, Ask and lenses, recruiter path, mobile, one risk, for each concept; recommendation.
- [x] Screenshots (1440 and 390, light and dark, every scroll step) and about 10 s scroll videos per prototype in `docs/v3/concepts/` via `scripts/v3-concepts.mts`; no console errors.
- [x] lint clean, typecheck clean, production build passes (static routes `/lab/a`, `/lab/b`, `/lab/c`).
- [x] STOP at G4: DECISIONS 11 written. `design-direction` is updated after the pick, not before.
- Not run: `phase-verify` screenshots of `/`, review agents, `/code-review`. The runbook assigns no agents to V1, the prototypes are throwaway (removed in V7), and the home page is unchanged.

### Rulings made in Phase V1

- Prototypes live at `/lab/*` with `robots: noindex`; they will ship in a build until V7 removes them (pre-approved), but nothing links to them.
- Fonts per prototype via `next/font` (Geist + Geist Mono; Newsreader + IBM Plex Mono; Archivo + Martian Mono), scoped to each route. The v2 base-layer heading style is neutralised inside the prototypes only.
- Found and fixed in the prototypes: a count-up re-read its own interim "0" after React's development double mount; final figures now live in `data-count`. The V2 `CountUp` primitive must keep this.
- A dev server was already running on port 3000 (not started by Claude); it was used as is.
- Concept screenshots stay PNG (about 6 MB) and the three prototype videos are committed (about 6 MB): they are our own pages and the G4 evidence.

## Phase V0 checklist

- [x] Skills: `webapp-testing` (Playwright via the repo's `@playwright/test`, Node instead of the skill's Python helper, same API), `frontend-design` loaded before the takeaways.
- [x] Four sites loaded at 1440×900 and 390×844; first screen plus eight one-viewport steps each, as JPEG in `docs/v3/refs/<site>/<desktop|mobile>/`. None failed or blocked automation.
- [x] Second pass for interaction: Eddy's boot gate, OS desktop, command palette, project volume, a case study and the git-log CV; Cartooneast desktop via PageDown (wheel did not scroll it); intro timings and reduced-motion behaviour.
- [x] Scroll videos recorded (`scroll.webm` per site and viewport) but git-ignored: about 21 MB of third-party recordings. Re-create with `docs/v3/refs/capture.mjs`.
- [x] `docs/v3/REFERENCES.md`: concept, structure, navigation, type, palette, scroll, transitions, micro-interactions, boot screen, mobile per site; "What to borrow as principles" (11) and "What to avoid" (9).
- No site changes, so no build, verify run or review agents (the runbook assigns none to V0).

### Rulings made in Phase V0

- Branch `redesign/v3` from `main` (v2 is merged).
- Playwright needed its pinned Chromium build (headless shell 1243) downloaded into the user cache; nothing changed in the repo.
- Screenshots stored as JPEG (quality 72) to keep the repo small (27 MB of PNG down to about 5 MB).
- `AGENTS.md` heading change (written by `next dev`) committed with this phase, as AGENTS.md itself advises.
- The untracked duplicate `REDESIGN_V3_RUNBOOK.md` at the repo root (identical to `docs/REDESIGN_V3_RUNBOOK.md`) is left alone and not committed.
