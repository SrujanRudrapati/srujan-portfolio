# Redesign status

Ledger for `docs/REDESIGN_RUNBOOK.md` (rule 2). One row per phase. Rulings (decisions Claude took without asking) are listed under the phase that made them so later sessions inherit them. Last updated 2026-10-29 (second session, stopped at Srujan's request before Phase 3 verify).

| Phase | Status | Commit | Notes |
|---|---|---|---|
| S — skills, agents, memory | done | `redesign: phase S — skills, agents, memory` (hash recorded by the next session) | 8 skills, 3 agents, CLAUDE.md, `npm run verify`. Checklist below. |
| 0 — Inspect | done | 7cf6e8a | `docs/REDESIGN_NOTES.md` has framework, styling, deploy mechanism, section list, Lighthouse baseline (desktop 100/100/100/100, mobile 97/100/100/100). Build passes. |
| 1 — Direction | done | c51492e | Three directions at `/design-preview`; pick recorded in NOTES ("Chosen direction: C, Spec sheet"). |
| 2 — Design system | done | b89d2ac | Tokens on `:root` + `[data-theme="dark"]`, no-flash toggle in localStorage, Archivo via `next/font`, primitives Container/Section/Card/Tag/Button/Stat/Reveal, AA contrast table in NOTES. Verified by reading the code; the Phase S screenshots show it rendering. |
| 3 — Hero + nav | in progress | 491260e (code) | Code matches the spec on inspection: sticky nav with `aria-current`, toggle, Resume, mobile menu with focus trap + Escape, skip link; hero with headline, subhead, two buttons, three proof chips, animated medallion SVG, `.enter` stagger < 700 ms; the Phase S 390 px fold screenshot shows chips above the fold. Session 2026-10-29 (evening): Phase 3 skills loaded; lint 0/0, typecheck clean, `npm run build` passes (routes `/`, `/_not-found`, `/design-preview`). `npm run verify -- --phase 3` was started and interrupted by Srujan before it wrote `verify.md`; its two partial screenshots were deleted so the next run starts clean. Still owed, in order: (1) `npm run verify -- --phase 3`, read `verify.md`, inspect 390/1280 light/dark shots; (2) run `recruiter-eyes` on `docs/screenshots/phase-3/`; (3) decide on the stale `e2e/home.spec.ts` snapshots (see "Not done in Phase S"); (4) Phase 3 checklist in this file; (5) closing commit `redesign: phase 3 — hero and navigation`. |
| 4 — Project system + diagrams | todo | | |
| 5 — Content updates | todo | | |
| 6 — Knowledge graph | todo | | |
| 7 — Lenses | todo | | |
| 8 — Ask Srujan | todo | | |
| 9 — Motion, a11y, perf, mobile | todo | | |
| 10 — Pre-release review | todo | | |
| 11 — Build, deploy, verify (G1) | todo | | |

## Phase S checklist

- [x] `.claude/skills/` has 8 skills: official `frontend-design`, `webapp-testing`, `claude-api`, `skill-creator` (copied whole from anthropics/skills, 2026-10-29); project `portfolio-facts`, `design-direction`, `static-export-check`, `phase-verify` (each under 150 lines).
- [x] `.claude/agents/` has `fe-reviewer`, `recruiter-eyes`, `fact-checker` (read-only tools plus Bash for checks; none edit).
- [x] `CLAUDE.md` exists (51 lines): compressed operating rules, skill table, phase → skills/agents map, "start every session by reading docs/REDESIGN_STATUS.md".
- [x] `npm run verify -- --phase S` produced `docs/screenshots/phase-S/` (390 and 1280, light and dark, plus mobile fold shots; `verify.md` all pass: 0 console errors, 0 failed requests, 0 overflow, 0 axe violations).
- [x] lint 0/0, typecheck clean, build passes (routes `/`, `/_not-found`, `/design-preview`).
- [x] One commit `redesign: phase S — skills, agents, memory`.

### Rulings made in Phase S

- The runbook was found at the repo root as `REDESIGN_RUNBOOK.md`; moved to `docs/REDESIGN_RUNBOOK.md`, the path the file itself names. Cost if wrong: one `git mv`.
- This file is the only ledger. The superpowers `executing-plans` workspace/brief scripts were not used because the runbook defines its own ledger and phase format.
- `scripts/verify-phase.mts` (not `.ts`): Node 22 strips types natively, so no `tsx` dependency; `.mts` tells Node it is ESM without the module-detection warning. The runbook's `npm run verify -- --phase N` works as specified.
- axe in the verify script uses the already-installed `@axe-core/playwright` rather than adding `@axe-core/cli`; Phase 9 may still run the CLI as the runbook says.
- `vitest` added to the allowed dev-dependency list in CLAUDE.md because Phase 8 requires "a Vitest test". Installed only when Phase 8 reaches it.
- ESLint now ignores `.claude/**`: the official `claude-api` bundle ships `.mjs` helper scripts that produced 7 unused-variable warnings and are not site code.
- The `claude-api` skill bundle is 2.2 MB of reference docs; committed as-is because S1 says to copy the whole folder.
- `npm run typecheck` (`tsc --noEmit`) was added as a script so the phase-verify routine has a one-word typecheck.
- `docs/REDESIGN_DECISIONS.md` created with no open questions. The missing `public/resume.pdf` is not a question: Section 2.6 says Srujan drops the file in; Phase 5 wires the link.

### Not done in Phase S

- The Playwright e2e suite (`npm run test:e2e`) was not run; it predates Phases 2 to 3 and its snapshots may be stale. Phase 3 close-out decides whether to update them.
- `.claude/skills/` did not exist when this session started, so per S1 the session must be restarted before Phase 3 close-out so the new skills and agents are watched.
