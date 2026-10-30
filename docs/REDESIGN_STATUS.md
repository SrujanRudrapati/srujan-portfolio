# Redesign status

Ledger for `docs/REDESIGN_RUNBOOK.md` (rule 2). One row per phase. Rulings (decisions Claude took without asking) are listed under the phase that made them so later sessions inherit them. Last updated 2026-10-30 (third session: Phases 3, 4, 5, 6 done).

| Phase | Status | Commit | Notes |
|---|---|---|---|
| S — skills, agents, memory | done | `redesign: phase S — skills, agents, memory` (hash recorded by the next session) | 8 skills, 3 agents, CLAUDE.md, `npm run verify`. Checklist below. |
| 0 — Inspect | done | 7cf6e8a | `docs/REDESIGN_NOTES.md` has framework, styling, deploy mechanism, section list, Lighthouse baseline (desktop 100/100/100/100, mobile 97/100/100/100). Build passes. |
| 1 — Direction | done | c51492e | Three directions at `/design-preview`; pick recorded in NOTES ("Chosen direction: C, Spec sheet"). |
| 2 — Design system | done | b89d2ac | Tokens on `:root` + `[data-theme="dark"]`, no-flash toggle in localStorage, Archivo via `next/font`, primitives Container/Section/Card/Tag/Button/Stat/Reveal, AA contrast table in NOTES. Verified by reading the code; the Phase S screenshots show it rendering. |
| 3 — Hero + nav | done | 1d08a21 | Sticky nav with `aria-current`, toggle, Resume (now visible on phones too), mobile menu with focus trap + Escape, skip link; hero with headline, subhead, status line (M.S. at ASU, available early 2027), two buttons, three quiet proof chips, animated medallion SVG, `.enter` stagger < 700 ms, chips above the fold at 390. Verify 4/4 pass, axe 0, e2e 48 pass (snapshots re-baselined), code-review approve, recruiter-eyes findings fixed. Checklist below. |
| 4 — Project system + diagrams | done | 71cca15 | `src/data/projects.ts` (8 projects migrated verbatim), Work section with filter chips, featured cards with large Stats, 3/2/1 grid, four inline SVG diagrams on one flow engine (dots, stages light on arrival, in-view only, static under reduced motion). Verify 4/4, axe 0, e2e 62 pass, fe-reviewer and fact-checker findings fixed. Checklist below. |
| 5 — Content updates | done | 7f78b08 | Facts Section 2 applied: Surplus AI metrics and production status, DevHacks × Cubbie and Label Lens featured, RC Car in the grid, featured order per facts, Celebal additions and intern stint, e-commerce, June 2026 start, new email everywhere, hero chip. `withBasePath` + CI env for the resume link, `.nojekyll`. Content dump for proofreading. Verify 4/4, e2e 62 pass, fact-checker run. Checklist below. |
| 6 — Knowledge graph | done | HASH_PENDING | `src/data/graph/` (157 nodes, 143 edges) is the source of truth; `projects.ts` and the experience, skills, certifications and education exports are `select*(graph)` views; `scripts/build-graph.mts` validates and emits `public/graph.json` + `public/search-index.json` in `prebuild`; `docs/GRAPH.md`. Site pixel-identical to Phase 5 at 390/1280 light/dark. Client bundle no longer carries the graph. fe-reviewer and fact-checker findings fixed. Checklist below. |
| 7 — Lenses | todo | | |
| 8 — Ask Srujan | todo | | |
| 9 — Motion, a11y, perf, mobile | todo | | |
| 10 — Pre-release review | todo | | |
| 11 — Build, deploy, verify (G1) | todo | | |

## Phase 6 checklist

Closed out 2026-10-30. Skills loaded: portfolio-facts, static-export-check, phase-verify.

- [x] lint 0/0, typecheck clean, build passes; `prebuild` runs the validator (`npm run graph`): 157 nodes (project 11, role 4, education 2, certification 4, skill 82, metric 18, industry 12, problem 12, artifact 9, event 3), 143 edges
- [x] `npm run verify -- --phase 6` passed (path `/`; 390 and 1280, light and dark). Evidence: `docs/screenshots/phase-6/verify.md`
- [x] screenshots inspected by pixel comparison of `docs/screenshots/phase-6` against `phase-5` (PIL `ImageChops.difference`): identical at all four viewport/theme pairs after the Governance order fix; the final re-run differed by 223 scattered pixels in the 390 light shot only (travelling diagram dots caught at another frame; the three other shots were identical in the same run)
- [x] axe: 0 violations; console: 0 errors; requests: 0 failed; overflow: 0
- Runbook Phase 6 items:
  - [x] 1. `src/data/graph.ts` exports `nodes`, `edges`, `graph`; node types project, role, education, certification, skill, metric, industry, problem, artifact, event; every node has id, type, label, summary (≤ 2 sentences, enforced), optional dates, evidence[], tags; edge types uses, achieved, solved, in, at, produced, during (allowed endpoints in `docs/GRAPH.md`)
  - [x] 2. projects, experience, skills, certifications, education migrated; `projects.ts` is `selectProjects(graph)`, `portfolio.ts` exports `selectExperience/SkillGroups/Certifications/Education(graph)`; Phase 4 and 5 components unchanged (`git diff a7d1652 -- src/components` touches only import paths and the Work server/client split)
  - [x] 3. `scripts/build-graph.mts` in `prebuild`: edge endpoints exist, edge types match allowed endpoints, metric value numeric or quoted plus ≥ 1 evidence, no node without summary, plus duplicate ids, empty labels, date format, dash scan, orphan projects/metrics/industries/problems; exits 1 on errors (seen working: the first run failed on 28 findings); emits `public/graph.json` and `public/search-index.json` (one document per node with id, type, label, summary, tags, evidence urls, linked metric text)
  - [x] 4. `docs/GRAPH.md`: file map, counts, type tables, validator rules, three-step "add a project"
- Runbook checklist:
  - [x] build passes with validation
  - [x] `graph.json` served at `<basePath>/graph.json`: present in `out/` (local, no prefix); CI build puts it under `/srujan-portfolio/graph.json` by the same `public/` copy; consumers must use `withBasePath` (documented in `types.ts` and GRAPH.md)
  - [x] site renders identically to end of Phase 5: pixel compare identical; `npm run -s content:dump` identical except the capstone's second metric (ruling below); skills, certifications, education arrays byte-identical (JSON compare against `a7d1652`)
- [x] `npm run test:e2e`: 68 passed (new "Skills" block guards group order and chip order and adds a `#skills` snapshot, so a selector regression like the Governance one fails CI)
- [x] fe-reviewer (WARN: 1 High, 4 Medium, 7 Low) and fact-checker (NEEDS FIXES: 2 contradicted, 8 unsupported, all in node summaries that the page does not render). Resolved:
  - High, fixed before the report arrived: Governance chip order (Unity Catalog pinned to its slot with `position`; e2e guard added).
  - Medium, fixed: the client bundle carried the whole graph. `Work` is now a server component that passes `Project[]` to the client `WorkExplorer`; `statusLabel`/`primaryLink` moved to `src/data/project-helpers.ts`; `profile`/`about` moved to `src/content/profile.ts` so the client nav stops importing the graph. Graph text no longer appears in any client chunk; the affected chunk went from 22.9 KB to 11.2 KB gzipped; total client JS 184 KB gzipped.
  - Medium, documented and asked: committed JSON can drift because the Pages workflow runs `next build` on Node 20 (DECISIONS question 5, default keep; `engines: node >= 22.6` added; GRAPH.md says to regenerate and commit).
  - Medium, documented: root paths in the JSON need `withBasePath` at render (`types.ts` and GRAPH.md).
  - Medium, accepted: the capstone has a second metric node (about 28% lower simulated holding cost, the figure already in its highlight). The grid card renders `impact[0]` only, so the page is unchanged; the figure is available to the lenses and the Ask index.
  - Low, fixed: node index built once per selector; `chip`/`label` validated as `uses`-only; shared `metric` factory in `factories.ts`; validator checks empty valueLabel, evidence labels, date format; `projectLinks` without mutation; `engines` field. Deferred: Vitest selector tests until Phase 8 installs Vitest.
  - fact-checker, all ten fixed: "about" restored on the 10 million records a day figure (two summaries); Surplus summary and the June 2026 event no longer date the start of production (event re-labelled "Started at ASU Surplus"); M.S. node keeps only its end date (`Dates.start` is now optional); Label Lens `during` edge removed (no date on record); "deployed on Vercel" → "live app"; AWS cert summary restates the name only; editorial sentence removed from the ungrounded-output problem; "courses" → "course". Re-validated and re-compared after the fixes.
- [x] STATUS row updated, commit `redesign: phase 6 — knowledge graph`

### Rulings made in Phase 6

- `uses`, `solved`, `in` and `produced` also accept a role as the source, and `at`/`during` accept education as the target, so the Celebal bullets and the degrees take part in the lenses; the runbook lists only the project cases.
- A `uses` edge with `chip: false` keeps a skill link in the graph without adding a stack chip, so the cards keep their Phase 5 chips exactly while the Skill map counts, for example, forecasting for the capstone.
- A skill in two Skills-section groups has two `groups` entries; `position` pins its slot where declaration order would move it.
- `.ts` extensions on the graph's relative imports (and `../data/graph.ts` from `portfolio.ts`) so Node runs the generator and the content dump without a bundler; `allowImportingTsExtensions` was already on.
- Generated JSON committed; see DECISIONS 5.
- Events: a hackathon win, the ASU Surplus start, and the expected graduation. Industry and problem nodes are categorisations of facts already on the page, with summaries that restate those facts; the fact-checker accepted the labels.

## Phase 5 checklist

Closed out 2026-10-30. Skills loaded: portfolio-facts, phase-verify, static-export-check.

- [x] lint 0/0, typecheck clean, build passes (routes `/`, `/_not-found`, `/design-preview`)
- [x] `npm run verify -- --phase 5` passed (path `/`; 390 and 1280, light and dark). Evidence: `docs/screenshots/phase-5/verify.md`
- [x] screenshots inspected: 390 light fold, 390 dark (Surplus card), 1280 light (Work header, Surplus, DevHacks, Label Lens, Watchtower cards)
- [x] axe: 0 violations; console: 0 errors; requests: 0 failed; overflow: 0
- Section 2 applied, item by item:
  - [x] 2.1 Surplus AI: status production, date "June 2026 to present", three impact figures with their markers (~80% per item, ~10 min per 100+ unit pallet instead of 1 to 2 hours, 14B via MLX), highlights for identification/grading/pricing/label printing/database export, merge rules keyed on serial number, cluster failures traced to macOS permissions and network routing; the "in progress" / "files still copying" chips, status detail, node notes, caption and desc are gone (authorised by 2.1); status chips now read "Qwen 14B on four Mac minis" and "Llama 3B on one"
  - [x] 2.2 DevHacks × Cubbie: featured, status hackathon, October 2026, 1st place Track 1 by public student vote, 82 submissions from 350+ students, Cooked / Receipts (493 tests) / Bailout descriptions, Cooked and Receipts repo links
  - [x] 2.3 Label Lens: featured, status live, live link, 44/44 quotes, 16 s to 4 to 9 s, 56 unit + 6 end-to-end tests, stack chips
  - [x] 2.4 Celebal: e-commerce added to About and the role summary; fashion e-commerce client bullet (Kafka and Spark on Databricks, impressions/clicks/conversions/spend/attribution, Power BI); on call for the 10M-records/day AWS pipeline (appended to the existing AWS bullet); tuned Spark and SQL for performance and cost; code review as senior data engineer on one project and two interns mentored; "Intern, Data Engineering, July to August 2022" as its own role; all existing bullets kept
  - [x] 2.5 RC Car under Other projects, status academic, B.Tech major project team of three, full parts list
  - [x] 2.6 email rudrapati.srujan@gmail.com everywhere (`profile.email` is the only source; Contact mailto and text; no JSON-LD or meta carried the old one); resume link stays `/resume.pdf` through `withBasePath`
  - [x] 2.7 kept unchanged: Watchtower, capstone, CI/CD, WLAN toolkit, F1 predictor, Kubernetes, Java chat, skills, certifications, education
  - [x] featured order Surplus AI, DevHacks × Cubbie, Label Lens, Supply Chain Watchtower (e2e asserts the h3 order)
- [x] `grep -rn` for the old email, "in progress", "copying" in `src/` and `public/`: zero hits
- [x] `docs/screenshots/phase-5/content-dump.md`: plain-text render of every project and experience entry plus hero, about, contact, certifications and education (from `npm run content:dump`)
- [x] hero proof chip updated: "Surplus AI, in production at ASU Surplus" (was "in active use")
- Runbook checklist:
  - [x] four featured cards in order
  - [x] RC Car under other projects (last card; e2e asserts)
  - [x] resume link → `/resume.pdf`; CI-parity build (`NEXT_PUBLIC_BASE_PATH=/srujan-portfolio npm run build`) emits `href="/srujan-portfolio/resume.pdf"`; local build emits `/resume.pdf`
  - [x] all repo/live links resolve: cooked 200, receipts 200, label-lens-iota.vercel.app 200, aws-cicd-pipeline 200 (curl -I -L)
- [x] `npm run test:e2e`: 62 passed, 6 skipped; Work, hero and Experience expectations updated to the new content (11 projects, 4 featured, 7 in the grid, four roles, 12 Celebal headings); snapshots re-baselined
- [x] fact-checker run: 190 claims checked, 190 supported, 0 contradicted, 0 unsupported, 0 missing; verdict CLEAN. Its two notes acted on: the dump script printed `[object Object]` for the extra links and `date: undefined` for undated projects (fixed, dump regenerated); the Intern role reuses the site's Celebal location "Jaipur, India" (same employer, same string; kept, noted here).
- [x] STATUS row updated, commit `redesign: phase 5 — content updates`

### Rulings made in Phase 5

- Removal of the Surplus "in progress" / "copying" wording (two status chips, the status detail sentence, three node notes, one caption sentence) is the removal the runbook itself orders in 2.1, so no DECISIONS question was raised. The "3B engine runs now" chip went with them: it described the interim state and would contradict "in production"; its fact survives as the "Llama 3B on one" chip.
- Cluster diagram node roles: nodes 1 to 4 "Qwen 14B" (node 1 also "Head node"), node 5 "Llama 3B", derived from 2.1 (four plus one) and the old diagram (node 1 head, nodes 2 to 4 receiving the 14B files). Asked as DECISIONS question 3 with this default.
- Label Lens has no date and DevHacks no stack in the facts; both omitted (empty beats invented) and asked as DECISIONS questions 1 and 2.
- Capstone date reworded from "2026, in progress" to "2026, ongoing": the capstone is still unfinished (2.7 keeps it), but the runbook's zero-hit grep for "in progress" is literal. Same fact, one word.
- The Tech Assistant role now starts "June 2026" (2.1), replacing "May 2026" that the old site carried.
- Featured impact figures sit in a three-column row at `text-3xl` with the label under the figure (`Stat stacked`) instead of three stacked `text-4xl` figures: still the largest and only red element on the card, but one row rather than three.
- `src/lib/paths.ts` (`withBasePath`), `basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined` in `next.config.ts`, and `NEXT_PUBLIC_BASE_PATH: /srujan-portfolio` as `env:` on the workflow's build step (the only workflow change the runbook allows). `public/.nojekyll` added per rule 6.
- `public/resume.pdf` is still absent (Srujan drops it in; DECISIONS item 4). The link target name is unchanged.

## Phase 4 checklist

Closed out 2026-10-30. Skills loaded: frontend-design, design-direction, portfolio-facts, phase-verify. Design notes: `docs/REDESIGN_NOTES.md`, "Phase 4" section.

- [x] lint 0/0, typecheck clean, build passes (routes `/`, `/_not-found`, `/design-preview`)
- [x] `npm run verify -- --phase 4` passed (path `/`; 390 and 1280, light and dark). Evidence: `docs/screenshots/phase-4/verify.md`
- [x] screenshots inspected: 390 light and dark, 1280 light and dark (Work section crops in both themes), plus per-diagram crops at 390, 768 and 1280 with rendered text sizes measured (minimum 12.0 px at 390, 12.3 px at 1280, 17 px at 768)
- [x] axe: 0 violations; console: 0 errors; requests: 0 failed; overflow: 0
- Runbook Phase 4 items:
  - [x] 1. `src/data/projects.ts` with the runbook schema plus optional fields so nothing is dropped; every existing project migrated; `docs/screenshots/phase-4/content-diff.md` has the field mapping, both dumps and a unified diff (generated with `npm run content:dump`)
  - [x] 2. featured cards: status badge, title, one-liner, Stats large (`text-4xl`, the only red), highlights, stack chips, links; main diagram inline, "How it works" parts and the two secondary diagrams in a native `<details>`
  - [x] 3. grid cards 3/2/1 columns: title, one-liner, one Stat, highlights, stack, link; title is the single anchor whose `::after` covers the card (one tab stop); cards with no link have no tab stop
  - [x] 4. hover and `:focus-visible` identical: 2 px lift (`motion-safe` only), top rule to cobalt, one shadow, arrow slides 2 px, 150 to 200 ms ease-out-quart
  - [x] 5. Surplus pipeline, cluster network, privacy layers and Watchtower agent flow as inline SVG on tokens; dots on connectors, stages light in order (one overlay per dot arrival); loop only in view and while the tab is visible (`useInView`); static and fully lit under reduced motion; `<title>` + `<desc>` + visible caption each
  - [x] 6. filter chips All / Production / AI/LLM / Data engineering / Hackathon as real buttons with `aria-pressed`, live count, empty state with "Show all projects"; no URL change
  - [x] 7. cards wrapped in Reveal with a 60 to 80 ms stagger (`delay` prop, `--reveal-delay`)
- Runbook checklist:
  - [x] every original project still present: 8 (2 featured + 6 grid), matches NOTES §6 (2 case studies + 6 cards); e2e asserts the counts
  - [x] impact numbers loudest element: Stat `text-4xl` on featured, `text-3xl` on grid; e2e asserts the figure is larger than the title
  - [x] keyboard reaches each card once: e2e covers a linked and an unlinked grid card
  - [x] diagrams animate only in view and are static with reduced motion: e2e has one test under `reducedMotion: reduce` (dots hidden, overlays opaque) and one under `no-preference` (`data-animate` on only while on screen, `flow-travel` and `flow-flash` running)
  - [x] readable both themes: diagram text never below 12 px rendered at 390 / 768 / 1280 (measured); tokens only
  - [x] grid reflows at 390/768/1280: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`; diagrams switch layouts at `lg`, narrow layout capped at 400 px on tablets
- [x] `npm run test:e2e`: 62 passed, 6 skipped. The old "Featured work" block was rewritten as "Work" (6 tests) and the `featured-work-*` snapshots were replaced by `work-*` baselines; hero and experience baselines re-written because the hero gained the status line in Phase 3's close-out.
- [x] `/code-review` equivalent: fe-reviewer (verdict WARN, 2 High, 4 Medium, 3 Low) and fact-checker (no invented facts; 2 in-scope nits). All High and Medium items fixed in this phase:
  - High: SVG text scaled below 12 px at real viewports. Fixed: breakpoint moved from `md` to `lg`, type raised to 15/13 units, narrow layouts redrawn on a 300-unit canvas for the 278 px phone slot, figure padding 16 px on phones, Watchtower wide layout tightened.
  - High: secondary diagrams squeezed into a 7/5 split. Fixed: stacked full width inside the details block.
  - Medium: only the first track lit a node. Fixed: one lit overlay per (track, arrival).
  - Medium: highlights and "How it works" paragraphs in muted 14 px. Fixed: ink at base size; muted stays for dates, credit, captions.
  - Medium: filter chips 36 px tall. Fixed: 44 px on phones (`h-11`), 36 px from `md`.
  - Medium: no test of the animated path. Fixed: "diagrams animate only while on screen" under `reducedMotion: no-preference`.
  - Low: `Layout` and `FeaturedCard` over 50 lines. Partly fixed: `Edges`, `Dots`, `Nodes`, `NodeText` and `FeaturedDetails` extracted; `FeaturedCard` body is still about 80 lines of JSX, accepted.
  - Low: focus ring relied on `:has()`. Fixed: the anchor keeps its own ring unless `@supports selector(:has(a))`.
  - Low: dead `flow-svg` class. Fixed: removed.
  - fact-checker: "Personal prototype" chip restored on Watchtower as a status note (rule 3); "Both spec sources" reverted to the original "Both sources".
- [x] STATUS row updated, commit `redesign: phase 4 — project system and diagrams`

### Rulings made in Phase 4

- Phase 4 is a faithful migration; Section 2 facts (DevHacks, Label Lens, RC Car, Surplus metrics, Celebal additions, email, in-progress wording) wait for Phase 5 as the runbook orders them. The fact-checker's full list is the Phase 5 worklist, plus one item it found that the runbook does not name: the Tech Assistant role says "May 2026 to present" while facts 2.1 say "started June 2026"; Phase 5 aligns it.
- Surplus AI shows the "Production" status word (facts 2.1) next to the old "in progress" status chips until Phase 5 removes the chips; both are facts on file today.
- Status strings were normalised to the five-word vocabulary (`production`, `live`, `hackathon`, `academic`, `personal`); the old "Personal prototype" chip is kept verbatim as a status note so no wording is lost.
- Filter facets (`tags`): `ai` = an LLM or ML model does real work (Surplus AI, Watchtower, capstone, WLAN toolkit, F1 predictor); `data` = a pipeline or dataset is the job (Surplus AI, capstone, WLAN toolkit). "Hackathon" matches nothing until Phase 5 adds DevHacks; the empty state covers it.
- `scripts/verify-phase.mts` now forces `scroll-behavior: auto` while it steps through the page: with the site's smooth scrolling the stepped scroll never settled, so Reveal blocks below the fold stayed hidden in desktop screenshots (the first Phase 4 run showed empty cards). The e2e suite never saw this because it runs under reduced motion.
- `tsconfig.json` gained `allowImportingTsExtensions` so `scripts/content-dump.mts` can import the data files by their real paths; `npm run content:dump` prints the plain-text render Phase 5 needs.
- Dots animate `offset-distance` (same documented exception as the hero); the stage lighting animates opacity only, which is the overlay approach the Phase 3 review suggested for the hero (Phase 9 may port it there).

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
