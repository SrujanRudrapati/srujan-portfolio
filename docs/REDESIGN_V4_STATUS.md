# Redesign v4 status

Ledger for `docs/REDESIGN_V4_RUNBOOK.md` ("Midnight & Bronze"; same format as `docs/REDESIGN_V3_STATUS.md`). One row per phase. Rulings are listed under the phase that made them. Branch `redesign/v4`, created from `redesign/v3` at 4679bf1 because v3 is not merged into `main` (V3 DECISIONS 20 still waits for `merge`): v3 and v4 ship together at G1, and v3 is not merged separately. Last updated 2026-11-01.

| Phase | Status | Commit | Notes |
|---|---|---|---|
| W0 — Setup | done | `redesign: phase W0 — setup` | Branch from `redesign/v3`; reference shots (11 views × 4 viewports) in `docs/v4/reference-shots/` via `scripts/v4-shots.mts`; `design-direction` and `motion-system` rewritten for v4. Checklist below. |
| W1 — Shell | done | `redesign: phase W1 — shell` | Dark-only tokens, Bodoni Moda + Hanken Grotesk, grain and glow; header (name + availability, frosted after 30px), footer with Arizona time, back pill, progress line, page transitions (View Transitions + fallback), cursor, magnetic, Lenis 0.09. GSAP removed from the shell. Checklist below. |
| W2 — Home | done | `redesign: phase W2 — home hub` | Headline (three masked lines), lede, now line, Ask link, four spotlight tiles, 2D dot field with five shapes; fits one screen at 1280×720 to 1920×1080; interim `/experience` and `/contact` routes so the tiles have pages. Checklist below. |
| W3 — Work (G5) | done; blocked at G5 (DECISIONS 21) | `redesign: phase W3 — work catalogue and list` | Segmented Catalogue/List; looping catalogue of the four featured (drag, trackpad, keys, pills, arrows); list of all eleven with metal figures; view-transition morph with per-project names and 60 ms stagger. Comparisons in `docs/v4/compare/`. Checklist below. |
| W4 — Project pages | not started | | |
| W5 — Experience | not started | | |
| W6 — About and Contact | not started | | |
| W7 — Integrate and clean up | not started | | |
| W8 — QA | not started | | |
| W9 — Ship (G1) | not started | | |

## Phase W3 checklist

- [x] Header area: back pill, "Work" (Bodoni), intro "Eleven projects, from offline AI in production to hardware. Each one leads with what it does and what changed." (count from the data), segmented Catalogue/List whose white highlight slides (measured width and offset, transform + width only).
- [x] Data (`src/data/work.ts`): all eleven graph projects. Featured four in runbook order (Surplus AI, Label Lens, Cooked/DevHacks × Cubbie, Supply Chain Watchtower) with kicker, key number and sublabel, one-line description and 2 to 4 tags; reference copy kept where it matches the facts, markers kept (`~15 → ~3 min`), en dashes written out (`16 s → 4 to 9 s`); Watchtower and Cooked lines from the graph (see DECISIONS 21). The seven smaller projects: one-liner, context or status as kicker, first three stack items as tags, first figure if any. The module throws if a featured slug is not featured in the graph or a project is missing.
- [x] Catalogue (`catalogue/Catalogue.tsx`): stage inside the page margins, 32px radius, `clamp(320px, 100svh − 500px, 620px)` (40px more held back than the reference for the 44px back pill); one full card at a time, sliding by `translateX(d × (100% + max(24px, 3vw)))`, side cards at 0.94; loops endlessly, a card that wraps jumps with no transition (`carousel.ts`, unit tested). Controls: "n of 4" (live region), progress pills (24px buttons drawing an 8px dot; active 28px bronze), round previous/next (magnetic). Input: drag/swipe over 60px, a horizontal trackpad gesture (one card per gesture, 650 ms lock), arrow keys on the focused stage. The front card opens its project; only the front card is focusable (others `inert`). Card layout as the reference. Cursor: "Open" on the front card, "Drag" on the stage.
- [x] List (`catalogue/WorkList.tsx`): rounded rows (24px) with the art thumbnail, name + kicker, description + tags, key number in the metal gradient; the four featured, then the other seven; every row links to its case study.
- [x] Morph: `document.startViewTransition` with `html.vt-toggle` (root holds still); card/row, art and name share `wi-N`, `wa-N`, `wn-N`; 800 ms with the easing token, 60 ms stagger (globals.css). No API or reduced motion: instant. Mid-morph frames in `docs/v4/compare/*/work-morph.jpg`.
- [x] Art: the reference's four CSS gradient plates in catalogue order (`catalogue/art.ts`), a plain plate for the smaller projects; no screenshots on cards.
- [x] Tests: `catalogue/carousel.test.ts` (5); `e2e/v4-work.spec.ts`: order and loop both ways, keys and focus, pills, drag threshold (40px stays, a long drag moves one card and opens nothing), trackpad gesture, front card opens its project, list order and links, toggle back, view transition with `vt-toggle`, axe on both layouts, stage and controls on screen at 1280×720, 1366×768, 1440×900, 1920×1080: 21 passed, 7 skipped (desktop-only cases on the phone project). Unit suite 99 passed.
- [x] lint, typecheck, build clean; `npm run verify -- --phase W3 --path /work --path /`: all pass (axe 0, console 0, failed requests 0, overflow 0). Screenshots inspected (phone `/work`, comparisons at 1280 and 1440).
- [x] G5 evidence: `scripts/v4-shots.mts` (now also a `work-morph` frame; `SHOTS_VIEWPORTS` limits viewports) shot the reference and the site at 390, 1280, 1440 into `docs/v4/reference-shots/` and `docs/v4/site-shots/`; `scripts/v4-compare.mts` composed 24 side-by-side images in `docs/v4/compare/`. DECISIONS 21 written. **Stopped at G5.**

### Rulings made in Phase W3

- Found and fixed while testing: a trackpad gesture in the first 650 ms after load was ignored (the lock started at 0); the click that ends a drag reached the page-transition listener before React's card handler and opened the project (the guard now runs on `window` in the capture phase, ahead of it); 8px pills failed axe's 24px target size (now 24px buttons drawing the dot).
- The v3 `/work` filters (production, AI, data, hackathon) are not in the reference and are not content; the same groupings remain in `/explore`'s lenses. The v3 work components stay until W7's cleanup.

## Phase W2 checklist

- [x] Headline "I build the / data layer, and the / AI on top of it." in Bodoni, three masks rising over 1.2 s with a 90 ms stagger (CSS only, reduced motion: static). `nowrap` above 560px; each mask has `.16em` bottom padding so descenders are not clipped. Screen readers get the sentence once (sr-only text; the lines are `aria-hidden`).
- [x] Lede from the reference, facts-checked: "Data and AI engineer, finishing an M.S. at Arizona State University." (facts 2.7 education, kept) + "I’ve been on call for a pipeline moving about 10 million records a day, and I now ship LLM systems that run offline, in production." The figure comes from the graph metric `records-per-day` with its marker ("about"; the reference had dropped it). Offline in production: facts 2.1.
- [x] Now line: pulsing green dot (`#7CC4A4`, 2.4 s, off under reduced motion) + "Now running Surplus AI in production at ASU Surplus" (2.1).
- [x] Ask entry: "Ask about my work" under the now line opens the existing Ask panel (preloads on hover/focus); ⌘K / Ctrl+K unchanged.
- [x] Four tiles from `src/data/home.ts`: Work "4 featured, 7 more" (counted from the graph), Experience "Celebal, ASU Surplus", About "M.S., Arizona State", Contact "Open to roles in 2027" (`profile.status`), with the reference's descriptions. Spotlight radial follows the pointer via `--mx`/`--my`; 4px lift and 40% bronze border on hover and on keyboard focus; arrow circle turns 45°. Phones: 2×2, arrows hidden.
- [x] Dot field (`home/DotField.tsx`, physics in `dot-sim.ts`, shapes ported in `dot-shapes.ts`): idle pipeline, work plates, experience bars + diamond, about head and shoulders, contact envelope; hover or focus a tile to reshape, leave the row to return. Spring k 0.018 to 0.048, damping 0.86, sine wobble, 60px cursor repulsion; steel `rgba(214,224,236,.6)` and ~18% bronze. Performance contract: one sprite per colour via `drawImage` (no `shadowBlur`), 1100 dots (700 under 700px), DPR ≤ 2, typed arrays mutated in place, targets cached per shape, full rate only while moving then ~12 fps, woken by a shape change or the cursor within 60px, stopped off screen (IntersectionObserver), on hidden tabs and on unmount. Reduced motion: the shape drawn once, redrawn on hover/focus.
- [x] Fit: `e2e/v4-home.spec.ts` asserts that at 1280×720, 1366×768, 1440×900 and 1920×1080 every headline line, paragraph, the dot field and all four tiles end inside the viewport, each headline line stays on one line, and nothing overflows sideways. Phones: 2×2 tiles, dots above the headline.
- [x] Tests: `src/components/home/dot-field.test.ts` (7: shapes in bounds and deterministic, springs settle on target, damping 0.86, repulsion only within 60px, retarget without allocation, ~18% bronze); `e2e/v4-home.spec.ts` (content from data, Ask opens, hover/focus reshape and return to idle, overflow + axe, the four desktop fits, phone layout): 13 passed, 6 skipped (desktop-only and phone-only cases). The v3 home tests in `e2e/home.spec.ts` and the `motion`/`three` specs that used the old home are retired in W7 (runbook W7.5); the a11y "split statements" test became "the headline is read once", and `openHome` now waits for the dot field's hydration mark.
- [x] lint, typecheck, build clean. `npm run verify -- --phase W2 --path / --path /experience --path /contact`: all pass (axe 0, console 0, failed requests 0, overflow 0); dark screenshots in `docs/screenshots/phase-W2/`. Inspected the phone fold and 1280/1440 hover states next to the reference.
- [x] W1 review findings fixed: the fallback transition can no longer leave `main` at opacity 0 (timeout, Back or unmount clear it) or push twice; a second link during a transition navigates instead of being dropped; the header, progress line and cursor have their own view-transition names so they hold still; skipped transitions no longer log an unhandled rejection; a malformed `#hash` no longer throws. Noted, not changed: Back pressed while a push is in flight can still land on the pushed page (Next gives no way to cancel a push; same as v3); reduced motion and pointer type are read once per page load; header and hover colour transitions are colour, not layout.

### Rulings made in Phase W2

- **Interim `/experience` and `/contact`.** The tiles link to them, and a dead link would fail `verify`. Each is the v3 component in the v4 page frame (back pill, Bodoni title) until W5 and W6. This also keeps the email, GitHub, LinkedIn and resume links on the site after the old footer was removed in W1.
- **Tile name capped at 38px** (reference 42px): in the reference "Experience" runs into the arrow circle at 1440×900; at 38px it clears. Phones use `clamp(22px, 6.4vw, 30px)` for the same reason at 390.
- **Content that left the home** (v3 statements, featured reel, proof strip, contact block): every item already lives on the case pages, `/about` and now `/contact`; W7 records the mapping in `docs/v4/IA.md` before any component is deleted.

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
