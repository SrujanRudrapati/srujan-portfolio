# Redesign v5 status: "Thread"

Ledger for porting `design/redesign.html` into the site (DECISIONS 26). Branch `redesign/v5`, from `main` at e4077c7. One row per stage; rulings below the stage that made them. Last updated 2026-11-13.

| Stage | Status | Commit | Notes |
|---|---|---|---|
| T1 — Design system + home | done; previewed and approved, merge to `main` requested (Srujan, 2026-11-13) | see merge commit | Tokens, themes, patterns, fonts, shell, the thread, the home page, the content changes from DECISIONS 26. Checks below. |
| T1b — Search engines | done, with T1 | with T1 | `app/sitemap.ts` from the routes, per-page title/description/canonical/card, Google verification, Person JSON-LD, a v5 `og.png`, server-HTML checks. Requested 2026-11-13. |
| T1c — Spreads | done, with T1 | with T1 | Prototype updated 2026-11-13: each project section opens with a spread (main scene plus three captioned vignettes). Ported to the home page as `Spread`, ready for the project pages. |
| T1d — Certified cards | done, with T1 | with T1 | Requested 2026-11-13. Five cards with badge, full name and issuer; the About illustration is the graduation cap alone. Badges not supplied yet: placeholders. |
| T2 — Project pages | not started | | Six featured pages (problem, what I built, results, stack, links, visual), the other nine restyled; `/work`, Experience, About, Contact, Explore, CV, palette, Ask and the 404 game restyled. |

## T1 checklist

- [x] Prototype committed to the repo as `design/redesign.html` (it was untracked at the root).
- [x] DECISIONS 26 records the answers; facts skill Section 3 holds the new facts (InvoiceGuard, RecordSync, Margin Radar, HeatShift, Fabric certification, names, location, availability).
- [x] Graph: Surplus AI renamed Surplus Station (slug `surplus-station`, `/work/surplus-ai` meta-refresh page); WLAN toolkit titled Network Anomaly Toolkit (slug kept); four projects added; five certifications; featured set Surplus Station, InvoiceGuard, Label Lens, RecordSync, DevHacks; Watchtower no longer featured. 174 nodes, 161 edges, 15 projects.
- [x] Design system: `@property` colours, derived tokens, eight themes, eight tile patterns, Archivo (wdth axis) and IBM Plex Mono via `next/font`, light only.
- [x] Lenis removed (dependency, store, ShellEffects, PageTransitions, `data-lenis-prevent`); dialog scrollers get `overscroll-behavior: contain` instead, so the wheel never scrolls the page behind Ask or the palette.
- [x] No GSAP: hero intro in CSS keyframes, thread intro eased in the existing rAF loop.
- [x] Home page: hero, highlights, six project sections with scenes, giants, ghosts, rings, demos and cards, More projects, Skills/Experience/Education/Certified, Let's talk with the kolam.
- [x] lint 0, typecheck 0, Vitest 126 passed (17 files), build passes.
- [x] Playwright, last full run after every fix: 378 tests, 328 passed, 50 skipped by design (desktop-only or mobile-only), 0 failed. Earlier, `v5-shell` and `v4-catalogue` repeated 3 times: 120 passed (one `v4-catalogue` wheel test had failed once and did not reproduce).
- [x] `npm run release:check` (CI base path): 9 required files, 27 root-relative links resolve. Served under `/srujan-portfolio/`: no failed requests, no console errors, both fonts load, all 22 internal links prefixed, the redirect lands, `sitemap.xml` (22 URLs), `og.png` and every page 200.
- [x] Agents: fact-checker (11 findings: 6 fixed, 2 left as questions in DECISIONS 27, 3 kept with a reason; see rulings) and fe-reviewer (1 HIGH, 6 MEDIUM, 5 LOW: all fixed).
- [x] Srujan previewed the home page and approved it (2026-11-13: "looks good").
- [x] Committed on `redesign/v5` and merged `--no-ff` into `main` on Srujan's request; rollback tag `v4-before-v5` on the previous `main` (e4077c7).

## Rulings made in T1

- **Contrast over the prototype's exact values.** `--mute` is ink at 72% (prototype 66%, which gave 4.3:1 on the sync theme). Small thread-coloured text uses `--thread-text` (thread 55% into ink). The tampered-invoice verdict, the Label Lens highlight and the Receipts bubble use ink with a thread edge instead of a thread fill.
- **Pallet bars to scale.** The "now" bar is 10/90 of the "before" bar, as the card's caption promises (the prototype drew 9%).
- **Copy corrected against the facts** (each change is commented in `src/data/home.ts`): no "PowerShell", "Windows", "in seconds" or "daily" for Surplus Station; "~80% less time per item"; "4 to 9 s" and "1 to 2 h" without dashes; "~½" keeps its marker; Margin Radar in the résumé's words; the CI/CD row drops "automatic rollback" (no source); DevHacks links to the Cooked and Receipts repositories instead of the profile; Experience dates from the résumé and the B.Tech added.
- **The v4 catalogue keeps its four art plates** (Surplus Station, Label Lens, Cooked, Watchtower) until `/work` is rebuilt in T2; `work.ts` and two tests now key on its own list rather than the graph's featured flag.
- **Global reduced-motion rule** changed from `transition-duration: 0.01ms` to `0s`: the old value transitioned every property, which made the giant headings measure wrong for reduced-motion visitors.
- **v4 `--accent` alias** points at `--thread-text`, and the Experience "Today" line fades by colour instead of opacity, so the not-yet-restyled pages pass axe on paper.
- **Removed** (approved in the plan): the v4 home hub (dot field, tiles), the v4 ring cursor and magnetic buttons, the scroll progress line, the footer clock and their tests.

- **Fact-checker fixes:** "~10M" keeps its marker; "Expected December 2026"; React out of the Label Lens stack (facts 2.3 do not list it); "44 of 44 AI warnings verified to quote the label"; "B.Tech major project"; "caught a leaking column". "2+ years" kept (Sep 2022 to Nov 2024 is over two years, plus the internship). PowerShell kept in the skills list (résumé Languages).
- **fe-reviewer fixes:** focus ring in `--thread-text` (raw thread was 2.5:1 on sync); demo buttons keep ink on hover with a thread ring; RecordSync announces the merge in a `role="status"` sentence; the tick counts only on screen and is static under reduced motion; the giant project headings are links to their pages (the "View" cursor now appears only over links); the thread caches 900 path samples instead of measuring the path 7 times a frame, sleeps under reduced motion until the next scroll, follows a mid-session reduced-motion change, ignores builds after unmount, resets the palette instantly on leaving and for printing; card type at 12px or more with the radius tokens; the redirect page has an h1.
- **Search engines:** one route list (`src/lib/site.ts`) feeds the sitemap and every canonical and `og:url`; the graph script no longer writes `public/sitemap.xml`; trailingSlash is off, so URLs have none except the root. The home title is "Srujan Rudrapati | Data and AI Engineer" (résumé summary). Person JSON-LD: name, job title, LinkedIn, GitHub; Rajasthan Technical University as alumniOf (B.Tech done) and Arizona State University as an affiliation (M.S. expected December 2026). The redirect and the 404 are `noindex`. `og.png` re-rendered in v5 by `scripts/og-image.mts` from the home copy (the old card said "available early 2027"). The Google token was pasted as `"content="hAhqi_…"`; only the token is used.

- **Spreads (T1c):** the 18 vignettes and the new Surplus scene (five Mac minis, "5 × Mac mini / offline") regenerated from the prototype into `art/drawings.tsx`; the scene's accessible label now says five. Captions checked against the facts: "In daily production use" → "In production"; "493 tests in CI" → "Receipts: 493 tests in CI"; "350+ students, 82 entries" → "82 submissions from 350+ students"; the other fifteen are supported as written. A fourth pin, vp3, desktop only: in the prototype the thread clipped the bottom vignette and its caption in all six sections at 1440px (measured); vp2 also sits 40px under the vignettes on phones (prototype 20px), since the 12px captions are taller. Captions are 11px at 360px rising to 12px, so MANUFACTURING fits a third of a phone row. New checks: three captions per section, every figure inside its spread and the screen, and the thread never inside a figure, at 360, 390, 768 and 1440px.
- **Last full run (after T1d):** lint 0, typecheck 0, Vitest 129 passed (18 files), Playwright 402 tests: 352 passed, 50 skipped by design, 0 failed; `release:check` ok. (One earlier run failed 276 tests with connection refused: the preview server on port 4321, which Playwright reuses, stopped mid-run; rerun clean.) Earlier, after T1c: lint 0, typecheck 0, Vitest 127 passed, Playwright 396 tests: 345 passed, 50 skipped by design, 1 failed: `ask.spec` "opens from the command palette" on the phone project, waiting 5 s for the lazily loaded Ask panel under full-suite load; it passed 5 of 5 run alone and also failed once in the first T1 run, before any spread work. Recorded as flaky, not changed. `release:check` ok.

- **Certified cards (T1d):** names from the graph's certification nodes; issuers Databricks, Microsoft (three), Amazon Web Services. No badge image was drawn, generated or downloaded: `public/badges/` does not exist yet, and each card shows a dashed "Badge to come" frame until its file is added (detected at build time; any of .svg, .png, .webp, .jpg). `verifyUrl` is in the data type, unset. The About scene keeps only the graduation cap and its "MS, ASU / 3.96 GPA" caption (rosettes and the "5 certifications" caption removed; viewBox narrowed to 180 and the scene to 234px so the cap keeps its size).

- **Education wording (Srujan, 2026-11-13):** on the home page, "Master’s in Data Science, Analytics, and Engineering. GPA 3.96." / "Graduating December 2026" and "Bachelor’s in Computer Science. GPA 3.38." / "Graduated 2023": the same shape in both rows (no start year, since the M.S. start is not in the facts). The cap caption reads "Master’s, ASU / GPA 3.96"; the Person JSON-LD uses the same words. Other pages (About, CV, Experience, Ask, and the RC car's "B.Tech major project") still say M.S. and B.Tech, from the graph.

## Open for Srujan

- InvoiceGuard and RecordSync repository URLs (placeholders shown).
- InvoiceGuard walkthrough and DevHacks demo videos, the DevHacks event photo (placeholders shown).
- DECISIONS 26 I: USB tools and models. The site's wording is used (Bash, Macs; Qwen 14B on four Mac minis plus Llama 3B on a fifth).
- DECISIONS 27 (fact-checker): "US clients" and "led" (résumé) versus a New Zealand telehealth client and "coordinated" (site). The site's wording is used until answered.
- The five badge images, saved in `public/badges/` as: `databricks-data-engineer-professional`, `microsoft-fabric-analytics-engineer-associate`, `microsoft-azure-data-engineer-associate`, `microsoft-azure-administrator-associate`, `aws-certified-ai-practitioner` (each `.svg`, `.png`, `.webp` or `.jpg`).
- DECISIONS 27: `public/robots.txt` already exists (since v2) and `release:check` requires it. Not removed; reply to remove it.
