# Redesign v3 status

Ledger for `docs/REDESIGN_V3_RUNBOOK.md` (same format as `docs/REDESIGN_STATUS.md`). One row per phase. Rulings are listed under the phase that made them. Branch `redesign/v3`, created from `main` at ecfa9fc (v2 was merged in 9dc7e7c). Last updated 2026-10-30.

| Phase | Status | Commit | Notes |
|---|---|---|---|
| V0 — Reference teardown | done | `redesign: phase V0 — reference teardown` | All four sites captured at 1440 and 390 (9 steps each plus interaction passes); `docs/v3/REFERENCES.md` with one section per site, 11 principles to borrow, 9 things to avoid. Checklist below. |
| V1 — Three concepts, prototypes (G4) | todo | | |
| V2 — Motion foundation | todo | | |
| V3 — IA and routing | todo | | |
| V4 — Home page story | todo | | |
| V5 — Case study pages | todo | | |
| V6 — Secondary pages | todo | | |
| V7 — Polish, mobile, perf, a11y | todo | | |
| V8 — Ship (G1) | todo | | |

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
