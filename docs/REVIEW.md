# Pre-release review (runbook Phase 10)

Release candidate: branch `redesign/v2`, reviewed at `f7e6117` (after removing `/design-preview` and dead code), fixes applied in the Phase 10 commit. Three read-only reviews ran in parallel: a demanding senior front-end engineer (`fe-reviewer`), a recruiter with 30 seconds (`recruiter-eyes`, screenshots in `docs/screenshots/phase-10/`), and a full fact check (`fact-checker`). Each issue below is marked **Fixed**, **Decision** (needs Srujan, asked in `docs/REDESIGN_DECISIONS.md`) or **Accepted** (with the reason).

## (a) Senior front-end engineer: top five, by impact

| # | Issue | Where | Status |
|---|---|---|---|
| 1 | Critical. `public/resume.pdf` does not exist, so Resume in the nav (every width), Contact, Recruiter mode and Ask cards would 404 live. | `src/content/profile.ts:21`; rendered at `src/components/SiteNav.tsx:55`, `src/components/Contact.tsx:40`, `src/components/explore/RecruiterLens.tsx:37` | **Decision** (DECISIONS 4, now blocking G1). Guard added: `npm run release:check` fails while any required file or root-relative link target is missing from `out/`. |
| 2 | High. CI runs `next build` on Node 20 with no graph validation, drift check, lint or tests before deploying. | `.github/workflows/nextjs.yml:53`, `:78` | **Decision** (DECISIONS 5, now recommended "switch CI"). Rule 6 forbids changing the deploy mechanism beyond an `env:` line without Srujan's yes. |
| 3 | High. Hero diagram text rendered at 6 to 9.5 px on phones (11- and 14-unit SVG text in a 440-unit viewBox at about 240 to 300 px). | `src/components/MedallionDiagram.tsx:46`, `:83`, `:95`; `src/components/Hero.tsx:49` | **Fixed**: full width on phones, sub-labels hidden below 640 px (title and desc keep the full text), stage labels 18 units; e2e asserts no visible diagram text under 12 px at 390. |
| 4 | Medium. A failed lens chunk or render could not recover: `React.lazy` caches a rejected import and the error boundary never reset; the error showed raw `error.message`. | `src/components/explore/Explore.tsx:17`, `:104`; `src/components/explore/LensErrorBoundary.tsx:11` | **Fixed**: the lens code loads with a dynamic import keyed on an attempt counter, the boundary is keyed on it too, "try again" reloads both, copy is plain ("This view could not load. Check your connection, then try again"); e2e aborts `graph.json` and recovers. |
| 5 | Medium. Ask evidence links (32 px) and Skill map chips at `md` (32 px) under the 44 px target; the target sweep did not cover the dialog or the Skill map. | `src/components/ask/EvidenceCard.tsx:63`; `src/components/explore/SkillMapLens.tsx:14`, `:22` | **Fixed**: `min-h-11` at every width; e2e sweeps the open Ask panel and `#lens=skills`. |

Also raised and handled:
- **Fixed**:
  - Cards that never revealed printed as empty boxes (print CSS forces `[data-reveal]` visible).
  - Body copy in the Timeline outcomes, Experience disclosures, By problem and By industry summaries, lens lists and Ask cards is now 16 px.
  - A lens or Ask link to a project card hidden by the Highlights filter now resets the filter first.
  - The page behind the phone menu is `inert` (deferred since Phase 3).
  - The Worker caps chunked request bodies while reading.
  - Stale comments are fixed (`PORTFOLIO_BRIEF.md`, the phone Resume note, the medallion header).
  - Unused `.theme-light` and `.theme-dark` classes, the leftover `scale` constant and the dead `start` script are removed.
  - `next` and `eslint-config-next` are bumped to 16.4.3 (`npm audit --omit=dev`: 0).
  - The 528-line `e2e/home.spec.ts` is split into `home`, `lenses`, `ask` and `phase9` specs plus `helpers.ts`.
- **Accepted**:
  - `themeColor` follows the system theme, not the toggle. Browser chrome only; a runtime meta swap is not worth the script.
  - `globals.css` is 460 lines. CSS for tokens, motion and print reads better in one file.

## (b) Recruiter with 30 seconds: top five, by impact (score 8/10, up from 6 at Phase 7)

| # | Issue | Where | Status |
|---|---|---|---|
| 1 | High. The strongest employer proof ("about 10 million records a day", Celebal) sits about 79% down the phone page; the fold chip says "Two years of data engineering at Celebal" with no number. | `home-mobile-light.png`, Experience; `src/content/profile.ts` (`proof`) | **Decision** (DECISIONS 7): rewording a proof chip is content. Recruiter mode and the OG image already lead with the figure. |
| 2 | High. The first featured card (Surplus AI) is about 2.7 phone screens long; a skimmer quits inside it. | `home-mobile-light.png`, Work; `src/components/work/FeaturedCard.tsx` | **Fixed**: on phones each featured card shows status, title, one line and its figures, and "Show details" opens the rest (diagram, problem, what I built, highlights, status, stack, links, how it works). Only when JavaScript runs (`html[data-js]`), so no-JS visitors see everything; desktop unchanged. e2e covers both. |
| 3 | Medium. Hero diagram cut at the phone fold and the availability line repeated in hero, About and Contact. | `home-mobile-light-fold.png`; `src/content/profile.ts` (`about`) | Diagram **Fixed** (labels legible, full width). The repeated availability sentence in About is **Decision** (DECISIONS 8). |
| 4 | Medium. The current role's Experience row showed no figure or line, unlike the Celebal and TA rows. | `home-mobile-light.png`, Experience; `src/components/Experience.tsx` | **Fixed**: rows without a summary lead with their first existing outcome ("Built Surplus AI, a private, offline AI system for ASU Surplus, now in production."). |
| 5 | Medium. "One-page summary" was a small, slightly indented text link; the best recruiter asset deserved button weight. | `home-mobile-light-fold.png`; `src/components/Hero.tsx` | **Fixed**: outlined button, aligned with "Get in touch". |

## Fact check (supporting the two reviews)

- **Result**: 310 claims checked, 308 supported, 0 contradicted.
- **Fixed**: "Show all 62 skills" counted list entries. The count is now distinct skills (60), since Databricks and Unity Catalog each sit in two groups.
- **Missing**: `public/resume.pdf` (see (a) 1).
- **Links**: every external link returns 200. LinkedIn returns its bot-block status to `curl` and should be checked once by hand.
- **Consistency**: the status line, current role, Celebal figures, Surplus figures, featured order and OG image agree everywhere.
- **Confirmations for Srujan**: the intern title "Intern, Data Engineering" (DECISIONS 9) and the open items 1 to 3.

## Removals (pre-approved or not content)

- `/design-preview` route and its stylesheet. Pre-approved in the runbook; its `robots.txt` line and skill references were updated.
- Dead code: `featuredProjects` and `otherProjects` (used only by the preview), the unused `Section` `intro` prop, the unused `Stat` `size` variant, `.theme-light` and `.theme-dark`, and the dead `start` script.
- Checked and clean:
  - No `console.log` in `src/`; the Worker has one deliberate `console.warn` logger.
  - No unused assets in `public/`.
