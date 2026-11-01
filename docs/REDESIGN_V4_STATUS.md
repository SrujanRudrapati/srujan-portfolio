# Redesign v4 status

Ledger for `docs/REDESIGN_V4_RUNBOOK.md` ("Midnight & Bronze"; same format as `docs/REDESIGN_V3_STATUS.md`). One row per phase. Rulings are listed under the phase that made them. Branch `redesign/v4`, created from `redesign/v3` at 4679bf1 because v3 is not merged into `main` (V3 DECISIONS 20 still waits for `merge`): v3 and v4 ship together at G1, and v3 is not merged separately. Last updated 2026-11-01.

| Phase | Status | Commit | Notes |
|---|---|---|---|
| W0 — Setup | done | `redesign: phase W0 — setup` | Branch from `redesign/v3`; reference shots (11 views × 4 viewports) in `docs/v4/reference-shots/` via `scripts/v4-shots.mts`; `design-direction` and `motion-system` rewritten for v4. Checklist below. |
| W1 — Shell | in progress | | |
| W2 — Home | not started | | |
| W3 — Work (G5) | not started | | |
| W4 — Project pages | not started | | |
| W5 — Experience | not started | | |
| W6 — About and Contact | not started | | |
| W7 — Integrate and clean up | not started | | |
| W8 — QA | not started | | |
| W9 — Ship (G1) | not started | | |

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
