# Redesign status

Ledger for `docs/REDESIGN_RUNBOOK.md` (rule 2). One row per phase. Rulings (decisions Claude took without asking) are listed under the phase that made them so later sessions inherit them. Last updated 2026-10-30 (third session: Phase 3 closed out, Phase 4 started).

| Phase | Status | Commit | Notes |
|---|---|---|---|
| S — skills, agents, memory | done | `redesign: phase S — skills, agents, memory` (hash recorded by the next session) | 8 skills, 3 agents, CLAUDE.md, `npm run verify`. Checklist below. |
| 0 — Inspect | done | 7cf6e8a | `docs/REDESIGN_NOTES.md` has framework, styling, deploy mechanism, section list, Lighthouse baseline (desktop 100/100/100/100, mobile 97/100/100/100). Build passes. |
| 1 — Direction | done | c51492e | Three directions at `/design-preview`; pick recorded in NOTES ("Chosen direction: C, Spec sheet"). |
| 2 — Design system | done | b89d2ac | Tokens on `:root` + `[data-theme="dark"]`, no-flash toggle in localStorage, Archivo via `next/font`, primitives Container/Section/Card/Tag/Button/Stat/Reveal, AA contrast table in NOTES. Verified by reading the code; the Phase S screenshots show it rendering. |
| 3 — Hero + nav | done | 1d08a21 | Sticky nav with `aria-current`, toggle, Resume (now visible on phones too), mobile menu with focus trap + Escape, skip link; hero with headline, subhead, status line (M.S. at ASU, available early 2027), two buttons, three quiet proof chips, animated medallion SVG, `.enter` stagger < 700 ms, chips above the fold at 390. Verify 4/4 pass, axe 0, e2e 48 pass (snapshots re-baselined), code-review approve, recruiter-eyes findings fixed. Checklist below. |
| 4 — Project system + diagrams | todo | | |
| 5 — Content updates | todo | | |
| 6 — Knowledge graph | todo | | |
| 7 — Lenses | todo | | |
| 8 — Ask Srujan | todo | | |
| 9 — Motion, a11y, perf, mobile | todo | | |
| 10 — Pre-release review | todo | | |
| 11 — Build, deploy, verify (G1) | todo | | |

## Phase 3 checklist

Closed out 2026-10-30. Skills loaded: design-direction, static-export-check, frontend-design, phase-verify.

- [x] lint 0/0, typecheck clean, build passes (routes `/`, `/_not-found`, `/design-preview`)
- [x] `npm run verify -- --phase 3` passed (path `/`; 4 runs: 390 and 1280, light and dark). Evidence: `docs/screenshots/phase-3/verify.md`
- [x] screenshots inspected with the Read tool: 390 light and dark fold shots, 1280 light and dark (first screen cropped and viewed)
- [x] axe: 0 violations; console: 0 errors; requests: 0 failed; overflow: 0
- Runbook Phase 3 items:
  - [x] sticky nav with `aria-current` active-section highlight (`SiteNav.tsx`, `use-active-section.ts`)
  - [x] theme toggle, Resume button, mobile menu with focus trap and Escape, skip link (e2e "Navigation" block, 4 tests pass on desktop and mobile projects)
  - [x] hero: headline, subhead, two buttons, three proof chips from facts already on the site (`profile.proof`)
  - [x] medallion diagram as animated inline SVG, dots travel source, bronze, silver, gold, serving, LLM; static and fully lit under reduced motion (`globals.css` `.medallion-*`, gated on `prefers-reduced-motion: no-preference`)
  - [x] `.enter` stagger: 5 blocks, 70 ms apart, 400 ms each, done by 680 ms
  - [x] fits above the fold at 390 px: `home-mobile-light-fold.png` shows chips ending at about 570 px of 844; e2e "fits above the fold on a phone" passes
- [x] `npm run test:e2e`: 39 functional tests passed; the 9 `visual` snapshot tests failed only because the baselines predate the Phase 2 restyle and Phase 3 hero (snapshots last written in 08ec7bd). Updated with `npm run test:e2e:update`; suite now 48 passed, 6 skipped (project-specific skips). Phases 4 to 7 will churn these again; they get re-baselined at each close-out.
- [x] `/code-review` (code-reviewer agent on `b89d2ac..HEAD -- src/`): no Critical or High; verdict approve. Findings re-graded by effect on a visitor:
  - Medallion keyframes animate `fill` and `offset-distance`, not only transform/opacity. Ruling: this is the design the design-direction skill specifies for diagrams (dots on connectors, stages light on arrival); recorded here as the one documented exception. Phase 9 may convert the stage lighting to an opacity overlay if Lighthouse or the main-thread profile shows cost.
  - Resume link `/resume.pdf`: file missing from `public/` and root-relative href ignores the basePath. Already scheduled: runbook 2.6 and the static-export-check skill assign this to Phase 5 (`withBasePath`, Srujan drops in the PDF).
  - Mobile menu: focus drops to body after a link click; `main` not `inert` while the menu is open. Low. Deferred to Phase 9 (accessibility pass).
  - Scroll-spy has no active link inside `#projects` and `#credentials` (no nav link for them). Low. Phase 7 restructures these sections into Explore; revisit then.
- [x] recruiter-eyes run on `docs/screenshots/phase-3/` (first pass scored 7/10). Findings re-graded by effect on a visitor and acted on in this phase:
  - High, fixed: nothing on the first screen said where he is now or when he is available. Added `profile.now` under the hero subhead ("M.S. student at Arizona State University. Graduating December 2026, available early 2027."), built only from the About paragraph and `profile.status`. Still above the fold at 390 (re-verified, fold shot).
  - High, fixed: the Resume button was hidden behind the hamburger on phones. Resume is now in the bar at every width; the theme toggle stays in the bar on desktop and sits inside the phone menu (labelled "Color theme"), which is what the e2e test already checks after opening the menu. The duplicate Resume link inside the panel was removed (same link, still in the bar; not content).
  - Medium, fixed: the proof chips used the same ink outline as the secondary button and read as three more buttons. `TagList` gained `tone="quiet"` (hairline `border-line` on `bg-surface`); the hero uses it, every other tag list is unchanged.
  - Medium, fixed: the email in Contact broke mid-address at 390 px. Mobile size dropped from `text-2xl` to `text-xl`; desktop unchanged. Phase 5 changes the address and Phase 7 redoes Contact.
  - Medium, not changed: the medallion diagram takes a phone screen between the chips and About. Ruling: the diagram is the signature element of the Spec sheet direction and the "where is he now" gap it was delaying is now answered in the hero itself. Phase 7 reflows About.
  - Low, deferred to Phase 7: chips could lead with the strongest word ("ASU Surplus: ..."); Experience paragraphs bury the numbers. Both are content and lens work.
- [x] STATUS row updated, commit `redesign: phase 3 — hero and navigation`

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
