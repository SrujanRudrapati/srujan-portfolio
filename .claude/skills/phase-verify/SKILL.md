---
name: phase-verify
description: The evidence routine that closes out a redesign runbook phase: build, serve, Playwright screenshots at 390 and 1280 in light and dark into docs/screenshots/phase-N/, axe, console-error check, STATUS update, review agents, and the commit message format. Load at the end of every runbook phase, whenever asked to verify, screenshot, check, or close out a phase, and before any commit named "redesign: phase N".
---

# Phase verify

A phase is done only when every step below has run in this session and the output was read. Evidence lives in the repo, not in memory.

## 1. Quality gates (fix until clean)

```sh
npm run lint && npm run typecheck      # 0 errors
npm run build                          # export succeeds; check the route list printed
```

Then `npm run dev` once (or trust the verify server) and confirm the page renders. For phases that touch tests: `npx vitest run` (Phase 8+) and `npm run test:e2e`. If a Playwright snapshot changed for a reason you intended, update it with `npm run test:e2e:update` and say so in STATUS.

## 2. Evidence: `npm run verify -- --phase N`

One command (`scripts/verify-phase.mts`, Node 22 type stripping, no extra deps). It builds, serves `out/` on :4321, and for every `--path` drives headless Chrome at 390x844 and 1280x800 in light and dark: scrolls so `Reveal` blocks fire, saves `docs/screenshots/phase-N/<slug>-<viewport>-<theme>.png` (plus a `-fold.png` of the first screen on mobile), runs axe with WCAG 2.2 AA tags, records console errors and warnings, failed or 4xx requests, and horizontal overflow. Writes `verify.json` and `verify.md` beside the screenshots and exits 1 on any failure.

```sh
npm run verify -- --phase 4                                   # home page, 4 runs
npm run verify -- --phase 7 --path / --path "/#lens=timeline"  # add one --path per lens or route
npm run verify -- --phase 9 --no-build                         # reuse the existing out/
```

Read `verify.md`. Open at least the two mobile screenshots and one desktop screenshot with the Read tool and look at them: a green report with a broken layout is not evidence. Fix every console error, 4xx, overflow, and axe violation, then re-run. Phase 9 additionally runs Lighthouse (`npx lighthouse@12 http://localhost:4321/ --preset=... ` mobile x3, median) and `npx @axe-core/cli`.

## 3. Review agents

Run the agents the runbook assigns to the phase (table in `CLAUDE.md`), in parallel where independent, and fix what they find before step 4:

- `fe-reviewer`: code quality, a11y, performance, static-export correctness, token discipline.
- `fact-checker`: every claim on the rendered page against `.claude/skills/portfolio-facts/SKILL.md`.
- `recruiter-eyes`: the 30-second scan over `docs/screenshots/phase-N/`.

Give each agent the phase number, the screenshot folder, and the diff range (`git diff <phase-start>..HEAD --stat`). Their findings are advice; re-grade by effect on a visitor, fix Critical and High, note the rest in STATUS.

## 4. STATUS and commit

Append the phase checklist to `docs/REDESIGN_STATUS.md` with pass/fail per item (copy the checklist lines from the runbook phase), the evidence paths, the agents run, and anything deferred. Set the row to `done` with the commit hash after committing. Then:

```sh
git add -A docs/screenshots/phase-N docs/REDESIGN_STATUS.md <changed files>
git commit -m "redesign: phase N — <summary>"
```

Mid-phase WIP commits are fine (`wip: phase N step K — <what>`); the closing commit uses the exact `redesign: phase N — <summary>` format. Never commit `out/`, `.next/`, or `test-results/`.

## Checklist (paste into STATUS)

- [ ] lint, typecheck, build clean
- [ ] `npm run verify -- --phase N` passed (paths listed)
- [ ] screenshots inspected: 390 light, 390 dark, 1280 light, 1280 dark
- [ ] axe: 0 violations; console: 0 errors; requests: 0 failed; overflow: 0
- [ ] runbook phase checklist items, each with pass/fail
- [ ] assigned agents run and findings resolved or noted
- [ ] STATUS row updated, commit `redesign: phase N — ...`
