# Redesign v3 status

Ledger for `docs/REDESIGN_V3_RUNBOOK.md` (same format as `docs/REDESIGN_STATUS.md`). One row per phase. Rulings are listed under the phase that made them. Branch `redesign/v3`, created from `main` at ecfa9fc (v2 was merged in 9dc7e7c). Last updated 2026-10-30.

| Phase | Status | Commit | Notes |
|---|---|---|---|
| V0 — Reference teardown | done | `redesign: phase V0 — reference teardown` | All four sites captured at 1440 and 390 (9 steps each plus interaction passes); `docs/v3/REFERENCES.md` with one section per site, 11 principles to borrow, 9 things to avoid. Checklist below. |
| V1 — Three concepts, prototypes (G4) | blocked: awaiting decision (G4, DECISIONS 11) | `redesign: phase V1 — three concept prototypes` | `/lab/a` Pipeline, `/lab/b` Notebook, `/lab/c` Spec Sheet, each a scrolling, animated hero + scroll sequence + project teaser from real facts; `docs/v3/CONCEPTS.md`; screenshots and scroll videos in `docs/v3/concepts/`. Recommended: A's structure with C's typography. Checklist below. |
| V2 — Motion foundation | todo | | |
| V3 — IA and routing | todo | | |
| V4 — Home page story | todo | | |
| V5 — Case study pages | todo | | |
| V6 — Secondary pages | todo | | |
| V7 — Polish, mobile, perf, a11y | todo | | |
| V8 — Ship (G1) | todo | | |

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
