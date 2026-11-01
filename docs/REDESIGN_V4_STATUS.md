# Redesign v4 status

Ledger for `docs/REDESIGN_V4_RUNBOOK.md` ("Midnight & Bronze"; same format as `docs/REDESIGN_V3_STATUS.md`). One row per phase. Rulings are listed under the phase that made them. Branch `redesign/v4`, created from `redesign/v3` at 4679bf1 because v3 is not merged into `main` (V3 DECISIONS 20 still waits for `merge`): v3 and v4 ship together at G1, and v3 is not merged separately. Last updated 2026-11-01.

| Phase | Status | Commit | Notes |
|---|---|---|---|
| W0 — Setup | done | `redesign: phase W0 — setup` | Branch from `redesign/v3`; reference shots (11 views × 4 viewports) in `docs/v4/reference-shots/` via `scripts/v4-shots.mts`; `design-direction` and `motion-system` rewritten for v4. Checklist below. |
| W1 — Shell | done | `redesign: phase W1 — shell` | Dark-only tokens, Bodoni Moda + Hanken Grotesk, grain and glow; header (name + availability, frosted after 30px), footer with Arizona time, back pill, progress line, page transitions (View Transitions + fallback), cursor, magnetic, Lenis 0.09. GSAP removed from the shell. Checklist below. |
| W2 — Home | in progress | | |
| W3 — Work (G5) | not started | | |
| W4 — Project pages | not started | | |
| W5 — Experience | not started | | |
| W6 — About and Contact | not started | | |
| W7 — Integrate and clean up | not started | | |
| W8 — QA | not started | | |
| W9 — Ship (G1) | not started | | |

## Phase W1 checklist

- [x] Tokens (§1) in `src/app/globals.css`: dark only, `color-scheme: dark`, `--bg #0B0F14` … `--metal`, live dot, page glow on `body` (scrolls), static grain (`body::after`, .035, no animation or blend), easing token, radii. Older Tailwind names (`ink`, `muted`, `line`, `accent`…) are aliases of the new tokens, so pages not yet rebuilt take the palette until W4 to W7 replace them. Light tokens, the theme script, `ThemeToggle`, `lib/theme.ts` and the palette's theme action removed.
- [x] Fonts via `next/font/google`: Bodoni Moda (variable, `opsz` axis, roman + italic) and Hanken Grotesk (variable); fallbacks Didot/Georgia and system-ui. Archivo and Martian Mono removed.
- [x] Header (`shell/Header.tsx`): fixed, 60px, name (Bodoni, links home) and "Available early 2027" with the bronze dot; nothing else. Frosted after 30px (`color-mix` 90% + `blur(10px)` + hairline). The v3 nav (links, number keys, Resume, Search/Menu button) removed; ⌘K / Ctrl+K still opens the palette.
- [x] Back pill (`shell/BackPill.tsx`): rounded, `rgba(232,234,237,.06)`, "Home" or "All work", magnetic. Used from W3 on.
- [x] Footer (`shell/Footer.tsx`, `Clock.tsx`): name and year, "Arizona, h:mm AM" (`America/Phoenix`, every 20 s), nothing about a draft.
- [x] Scroll progress: 1px metal line, `scaleX` from scroll, one write per frame.
- [x] Page transitions (`shell/PageTransitions.tsx`): View Transitions API (old root fades 260 ms; new root rises from 14px over 800 ms with the easing token); fallback classes on `main`; reduced motion instant. Scroll resets to top, focus to the new `h1`. GSAP no longer used; the tested path helpers moved to `shell/route-paths.ts` (test moved with them).
- [x] Cursor (fine pointer, motion only): 34px bronze ring (lerp 0.18) + 5px dot; 58px over links/buttons; 84px bronze disc with a label from `[data-cursor]` ("Open"/"Drag" from W3). Grows by `scale`, not width (motion rule: transform and opacity only), so the label sits outside the scaled ring. Label resets on route change.
- [x] Magnetic: any `[data-magnetic]` element moves 25% of the pointer offset (transform), springs back over 600 ms.
- [x] Lenis lerp 0.09 on its own rAF; off under reduced motion and on touch/coarse pointers.
- [x] Tests: `src/components/shell/pointer.test.ts`, `Clock.test.ts` (Vitest, 7 new), `e2e/v4-shell.spec.ts` (header contents and frosting, dark only, footer clock, progress line, client navigation lands at the top with focus on h1, no cursor under reduced motion, cursor grows over links): 15 passed, 1 skipped (cursor on mobile).
- [x] lint, typecheck, build clean. `npm run verify -- --phase W1 --path / --path /about --path /work --path /work/surplus-ai`: 16 of 16 pass (axe 0, console 0, failed requests 0, overflow 0). Screenshots in `docs/screenshots/phase-W1/` (dark only kept: the "light" runs render the same dark page now; deleted to save 10 MB). Inspected the `/about` phone fold and desktop.
- Agents: none assigned to W1. A `code-reviewer` pass over the W1 diff runs alongside W2; its fixes land in W2.
- Found: the CSS minifier dropped the unprefixed `backdrop-filter` when both prefixed and unprefixed were written; only the standard property is written now (the build adds the prefix).

## Phase W0 checklist

- [x] Branch `redesign/v4` from `redesign/v3` (4679bf1); v3 is not merged (`git merge-base --is-ancestor redesign/v3 main` is false), so v3 and v4 ship together at G1.
- [x] Reference present: `docs/v4/reference/srujan-premium-concept.html` (Srujan put it in the repo).
- [x] Reference screenshots at 390×844, 1280×720, 1440×900, 1920×1080: home idle, home with each of the four tiles hovered, work catalogue, work list, a project (Surplus AI), experience, about, contact (44 JPEGs, about 2.5 MB) in `docs/v4/reference-shots/<viewport>/`. `scripts/v4-shots.mts site` takes the same shots of the built site for G5 and W8.
- [x] `design-direction` rewritten for v4 (tokens, type, radii, surfaces, layout and per-page notes, banned list, copy, measured contrast); v3 and v2 sections replaced by a history pointer.
- [x] `motion-system` rewritten for v4 (§10 rules, transitions, dot field contract, cursor, magnetic, Lenis, reduced motion); GSAP, WebGL, poster and physics guidance removed. `portfolio-facts` unchanged.
- [x] Skills loaded for the run: `frontend-design`, `design-direction`, `motion-system`, `portfolio-facts`, `static-export-check`, `phase-verify` (the last three as each phase needs them).
- No site code changed, so no build or review agents (the runbook assigns none to W0).

### Rulings made in Phase W0

- **Eleven projects, not ten.** The reference says "Ten projects" and "4 featured, 6 more", and lists six smaller ones. The graph has eleven: the four featured plus seven, the seventh being the capstone, Demand Forecasting & Inventory Optimization. Never deleting content wins: all eleven appear; the Work tile hint reads "4 featured, 7 more" and the intro counts eleven.
- **Featured order.** `portfolio-facts` lists Surplus AI, DevHacks × Cubbie, Label Lens, Watchtower; the runbook (W3.2) and the reference use Surplus AI, Label Lens, Cooked/DevHacks × Cubbie, Watchtower. The runbook wins over the reference and is the more specific instruction for the catalogue, so the catalogue follows it.
