# Redesign v4 status

Ledger for `docs/REDESIGN_V4_RUNBOOK.md` ("Midnight & Bronze"; same format as `docs/REDESIGN_V3_STATUS.md`). One row per phase. Rulings are listed under the phase that made them. Branch `redesign/v4`, created from `redesign/v3` at 4679bf1 because v3 is not merged into `main` (V3 DECISIONS 20 still waits for `merge`): v3 and v4 ship together at G1, and v3 is not merged separately. Last updated 2026-11-01.

| Phase | Status | Commit | Notes |
|---|---|---|---|
| W0 — Setup | done | `redesign: phase W0 — setup` | Branch from `redesign/v3`; reference shots (11 views × 4 viewports) in `docs/v4/reference-shots/` via `scripts/v4-shots.mts`; `design-direction` and `motion-system` rewritten for v4. Checklist below. |
| W1 — Shell | done | `redesign: phase W1 — shell` | Dark-only tokens, Bodoni Moda + Hanken Grotesk, grain and glow; header (name + availability, frosted after 30px), footer with Arizona time, back pill, progress line, page transitions (View Transitions + fallback), cursor, magnetic, Lenis 0.09. GSAP removed from the shell. Checklist below. |
| W2 — Home | done | `redesign: phase W2 — home hub` | Headline (three masked lines), lede, now line, Ask link, four spotlight tiles, 2D dot field with five shapes; fits one screen at 1280×720 to 1920×1080; interim `/experience` and `/contact` routes so the tiles have pages. Checklist below. |
| W3 — Work (G5) | done; G5 approved (DECISIONS 21) | `redesign: phase W3 — work catalogue and list` | Segmented Catalogue/List; looping catalogue of the four featured (drag, trackpad, keys, pills, arrows); list of all eleven with metal figures; view-transition morph with per-project names and 60 ms stagger. Comparisons in `docs/v4/compare/`. Checklist below. |
| W4 — Project pages | done | `redesign: phase W4 — project pages` | Eleven pages from one template: art band (featured) or compact title, intro with status and links, up to three metal result tiles, What it does / The entries, The problem, How it’s built (diagrams restyled, draw once on entry, no GSAP), Stack, Next project looping inside its group. v3 case-study template removed. Checklist below. |
| W5 — Experience | done | `redesign: phase W5 — experience timeline` | Year axis 2023 to 2027, one lane per graph role (Celebal intern, Celebal associate, ASU teaching, ASU Surplus) plus Milestones (DevHacks diamond), Today line; bars are buttons; detail panel with every outcome, figures and projects, opening on the current role. Checklist below. |
| W6 — About and Contact | done | `redesign: phase W6 — about and contact` | About: portrait frame (outline until a photo exists, DECISIONS 22), statement, two paragraphs, the medallion diagram, facts grid with education, all certifications and every skill group. Contact: large Bodoni email, composer (mailto with the fixed subject), GitHub, LinkedIn, resume, Ask entry. Checklist below. |
| W7 — Integrate and clean up | done | `redesign: phase W7 — integrate and clean up` | /cv, 404 and game, palette, Ask panel and /explore in v4 tokens; v3 3D, posters, GSAP, rail and unused v3 components removed after the IA mapping (`docs/v4/IA.md`); three, @react-three/*, cannon-es, gsap and gainmap uninstalled; old specs rewritten for v4. Checklist below. |
| W8 — QA | done | `redesign: phase W8 — qa` | 48 reference comparisons; fit on 13 routes at 8 sizes (measured with the overflow clip lifted); Lighthouse mobile 92 to 95, desktop 100, accessibility 100; 60 fps hovering; JS 151 to 157 kB (v3: 207); axe clean everywhere; Chrome and WebKit suites green; fe-reviewer, fact-checker and recruiter-eyes run and fixed. Checklist below. |
| W9 — Ship (G1) | done; **stopped at G1** (DECISIONS 25) | `redesign: phase W9 — release checks; G1 awaiting merge` | Lint, typecheck, CI-parity build with `/srujan-portfolio`, `release:check`, click-through of all 18 routes under the prefix; rollback tag `v2-before-v4` on `main` (local). Waiting for `merge`. |

## Phase W9 checklist

- [x] `npm run lint` and `npm run typecheck`: clean.
- [x] `npm run release:check`, which runs the CI-parity build with `NEXT_PUBLIC_BASE_PATH=/srujan-portfolio`: 9 required files present (`.nojekyll`, `index.html`, `404.html`, `resume.pdf`, `graph.json`, `search-index.json`, `og.png`, `sitemap.xml`, `robots.txt`), and root-relative links resolve.
- [x] The prefixed export was served at `http://localhost:4000/srujan-portfolio/` and every route clicked through: home, Work, the 11 project pages, Experience, About, Contact, Explore and CV.
  - All 18 routes returned 200, with no console errors and no failed requests.
  - No unprefixed `href` or `src` anywhere. All 49 internal links and assets resolve.
  - The Timeline lens loads `graph.json`, and Ask answers from `search-index.json`.
  - The 404 page answers 404.
- [x] Rollback point: `main` (ecfa9fc) tagged `v2-before-v4` (annotated, local, not pushed). v3 was never merged into `main`, so this branch carries v3 and v4 together.
- [x] **STOP at G1** (DECISIONS 25): "Ready to merge `redesign/v4`. Reply `merge`."

## Phase W8 checklist

- [x] **Visual comparison.** `scripts/v4-shots.mts` re-shot all 12 views at 390×844, 1280×720, 1440×900 and 1920×1080 (`docs/v4/site-shots/`). `scripts/v4-compare.mts` composed 48 side-by-side images (`docs/v4/compare/<viewport>/<view>.jpg`). The remaining differences are intentional:
  - Real data replaces placeholders (DECISIONS 21).
  - The project intro line (one-liner, status, dates, links) sits between the band and the results.
  - The phone band is shorter.
  - Experience has a lane for the teaching role, and its intro has no "four years" claim.
  - The About paragraphs are written from the facts, and About has the medallion diagram and the full facts grid.
  - The Contact intro carries the status line, and the composer's buttons are not on an inner strip.
- [x] **Fit.** `e2e/v4-fit.spec.ts` checks that `scrollWidth === innerWidth` on 13 routes (measured with the html and body `overflow-x: clip` lifted, so real overflow cannot hide; fe-reviewer) at 360, 390, 768, 1024×768, 1280×720, 1366×768, 1440×900 and 1920×1080. The home tiles end inside the viewport at the four desktop sizes (`v4-home.spec.ts`). The catalogue stage and its controls are on screen at 1280×720 and up (`v4-work.spec.ts`, rechecked after the toggle grew to 44px).
- [x] **Performance.** Lighthouse, median of 3:

  | Route | Mobile | Desktop | Accessibility | CLS | TBT (mobile) |
  |---|---|---|---|---|---|
  | `/` | 95 | 100 | 100 | 0 | 10 ms |
  | `/work` | 92 | 100 | 100 | 0 | 12 ms |
  | `/work/surplus-ai` | 95 | 100 | 100 | 0 | 11 ms |
  | `/experience` | 95 | 100 | 100 | 0 | 10 ms |
  | `/about` | 95 | 100 | 100 | 0 | 22 ms |
  | `/contact` | 95 | 100 | 100 | 0 | 11 ms |

  Targets met: mobile 90 or more, desktop 98 or more, accessibility 100, CLS under 0.02. Simulated mobile LCP is about 2.9 to 3.2 s, the headline text under Lighthouse's throttling. `scripts/lighthouse.mts` gained a desktop preset.
- [x] **Frame rate.** `scripts/v4-frames.mts` records 5 s of tile hovering and dot-field repulsion on the home page with motion on, at 1440×900. Result: 316 frames at a mean of 60 fps, p95 16.8 ms, worst 16.8 ms, no dropped frames, no clusters, no long tasks. A blank page measures 60.5 fps on this machine, so the browser was not capped.
- [x] **Bundle, before and after.** Module JS on `/`, gzip: v3 206.7 kB (V7, with GSAP; DECISIONS 19) against v4 154.1 kB. Every v4 route is 151 to 157 kB, under the 160 kB budget. React DOM is about 70 kB and the Next router about 60 kB of that; the shell is 12 kB.
- [x] **Accessibility.**
  - axe reports no violations on every route at desktop and phone size (`v4-fit.spec.ts`), and inside the palette, Ask and game dialogs (`a11y`, `ask`, `v6`).
  - The keyboard pass is in the specs: home Tab stops all show a ring, catalogue arrows and pills, the Catalogue/List toggle, timeline bars by Enter, the composer, ⌘K, and Escape returning focus.
  - Reduced motion: Playwright defaults to `reducedMotion: "reduce"`, so every route and spec above ran under it. The motion variants (transitions, the toggle morph, the diagram draw, the lens fade) are tested separately with motion on.
  - Tap targets are 44px or more on 11 routes at 390 and 360 (`mobile.spec`).
- [x] **Browsers.** Final run, Chrome desktop and Pixel 7: 263 passed, 41 skipped. WebKit desktop and iPhone 14 (`npm run test:e2e:cross`): 256 passed, 47 skipped, plus the cursor test, which raced hydration and now waits for it (passes 3 of 3). Firefox cannot launch on this machine (the Playwright Firefox process fails to start, as in v3 V7); without the View Transitions API the catalogue/list switch is instant by design.
- [x] `npm run verify -- --phase W8` over 13 routes: all pass. Screenshots are in `docs/screenshots/phase-W8/`.
- [x] **fact-checker** (whole site, about 230 claims, nothing contradicted). Four unsupported claims, all fixed:
  - The Cooked figure "1st of 82" read as first of all 82; it is now "1st" with "Track 1, public student vote" (2.2), which also stops it overflowing the phone card.
  - The home lede said "LLM systems that run offline" (plural); it now says "an offline LLM system in production" (2.1).
  - "in one run" was removed from the Watchtower problem summary.
  - "certification" became "certifications" on the About tile.
  - The unused `profile.about` string has a typographic apostrophe.
  - LinkedIn returns 999 to bots, so check it in a browser; the URL is unchanged since v2.
- [x] **fe-reviewer** (no Critical). Fixed:
  - High: the mouse wheel in the Ask panel scrolled the page behind it. Lenis now skips open dialogs and `[data-lenis-prevent]`; tested with motion on in `v4-motion.spec`.
  - High: the catalogue card text sat on bright art. The card shade now darkens the top and bottom, with a stronger shade on phones. Pixel-sampled on all four plates at 1440 and 390: every text block is at least 6.3:1.
  - High: the fit test could not fail (see Fit above).
  - Medium: timeline bars use `aria-pressed` instead of `aria-expanded`.
  - Medium: the `/explore` lens chips and cards are pills and 24px tiles, and the `text-xs` step is now 13px site-wide.
  - Medium: dead code removed: the palette-open event, `StatusNoteChip`, `primaryLink` and the catalogue's side-card branch.
  - Medium: Ask now links roles to `/experience` and education to `/about#credentials`.
  - Medium: new `e2e/v4-motion.spec.ts` covers the Ask wheel, the dot field stopping on a hidden tab and after unmount, and magnetic springback.
  - Low: the sitemap is generated at build with all 18 URLs, and a `--on-art` token replaces the hard-coded text colour on art.
  - Low: every transition uses `--ease`, except the allowed 260 ms fade-out.
  - Low: the duplicate `.pips` rule is merged and the `/explore` cursor label reads "Open".
  - Low: the catalogue arrows work with the front card focused, and focus stays on the stage.
  - Low: a failed email copy is announced, and the 404 list is built from `MAIN_PAGES`.
  - Low: the images README and the stale globals comment are updated.
- [x] **recruiter-eyes**: 6/10 on the 30-second scan. Fixed directly: the phone timeline opened at 2022 with the current role off screen; it now opens at Today (tested). Its suggestions that would change the G5-approved design are DECISIONS 24, with defaults applied: keep the approved design.

### Rulings made in Phase W8

- **Experience axis end.** The axis ends at early 2027 (`timeline-axis.ts`), so after about February 2027 the "Today" line sits at the right edge. That matches "available early 2027"; the axis should be extended at the next content update.
- **The reference HTML keeps its own copy** ("1st of 82", "LLM systems"). The site follows the facts, as the runbook rules say.

## Phase W7 checklist

- [x] W7.1 `/cv`: same content (`RecruiterLens`), v4 page frame with back pill and title (screen only), sheet on a rounded tile, name in Bodoni, figures in metal Bodoni, chips and print button as pills. Print: v4 tokens remapped to black on white, glow and grain off, padding removed; `lenses.spec` checks one page in Letter and A4 for `/cv` and the Recruiter lens.
- [x] W7.2 404: back pill, "Row not found", the query panel, pill links to every page (Experience, Contact and Explore added), and the "Clean the pipeline" game restyled: midnight board on `--surface`, bronze paddle, steel records, faint bronze/steel/gold bands, Hanken labels, pill buttons, rounded 24px board, 28px dialog from the palette.
- [x] W7.3 Palette and Ask panel: rounded 28px solid panels on `--surface` with a dark backdrop (the site header stays the only frosted element), pill inputs and buttons, bronze-tinted active option, Bodoni titles; mono labels gone. The palette lists every v4 page (Work, Experience, About, Contact, Explore, CV); the unused number-key hints were dropped. Ask's "I don’t have anything on that" now uses a typographic apostrophe.
- [x] W7.4 Removed after the IA mapping (`docs/v4/IA.md`: every v3 visual and every v3 home item mapped to a v4 route): `src/components/three` (scenes, stage, physics), `public/three` (1.0 MB), `public/posters`, the `/studio/posters` route and `scripts/assets`, the GSAP primitives in `components/motion` (`lenis-store` moved to `shell/`), `site/Rail`, `PageHead`, `ui.tsx`, the v3 `About`/`Contact`/`Experience`/`Credentials`/`Skills`/`AnimateInView`/`Button`/`Card`/`Reveal`, the v3 work index components no longer routed, `covers.ts` (now `screenshots.ts`), the `v3-*` capture scripts. Dependencies uninstalled: `three`, `@react-three/drei`, `@react-three/fiber`, `cannon-es`, `gsap`, `@monogrid/gainmap-js`, `@types/three` (resolves v3 DECISIONS 19). `/explore` kept in the v4 frame with art plates instead of 3D covers and a fade instead of the Flip (DECISIONS 23). The medallion diagram stays on About (W6). The game's seeded random moved to `game/rng.ts`.
- [x] W7.5 Tests: removed `home.spec` (v3 home and its pixel snapshots), `motion.spec` (GSAP/WebGL leak counters) and `three.spec`; rewrote `a11y`, `ask`, `lenses`, `mobile`, `phase9`, `site` and `v6` for v4 (Ask from the home button, ⌘K instead of the v3 header buttons, the 404 links, older anchors, tap targets on every v4 route, static medallion); the `desktop-light` project is gone (dark only). New views were covered in W3 to W6 (catalogue loop, keyboard, toggle, timeline selection, composer mailto, reduced motion). Full suite: 224 passed, 30 skipped (device-specific) on desktop and phone; unit suite 112 passed (the 3D and count-up tests went with their code).
- [x] Found by the rewritten checks and fixed: the Work Catalogue/List buttons were 38px tall (now 44px), timeline bars and the milestone were 28px and 24px (now 44px buttons with the visible pill drawn inside; the two-month internship bar is 44px wide), the Contact email was 33px tall at phone width (padded to 44px), the About diagram's smallest label was 11.9px at 390 (panel padding tightened), the custom cursor elements were only transparent on touch (now `display: none` without a fine pointer), and the Recruiter lens printed on two pages (v4 page padding; reset in print).
- [x] Bundle: initial JS per page (gzip, module scripts only; the `noModule` polyfill chunk is not loaded by modern browsers) is 151 to 157 kB on every route, under the 160 kB budget. `/experience` was 164 kB because the client chart imported the graph through `data/experience.ts`; the axis helpers now live in graph-free `data/timeline-axis.ts`.
- [x] `scripts/verify-phase.mts`: dark theme only, the 3D asset budget removed with the assets, and a deliberate `/no-such…` probe may answer 404. `npm run verify -- --phase W7 --path /cv --path /explore --path "/explore#lens=timeline" --path /no-such-page --path /experience --path /about`: all pass.
- [x] lint, typecheck, build clean.
- [x] fe-reviewer (no Critical). Fixed:
  - High: the palette's active option had only a 15% bronze fill, about 1.3:1; it now also has a 1.5px bronze ring.
  - Medium: the "Intern" label sat on its widened pill; it now starts after the 44px pill.
  - Medium: the game board's description said "blue filter"; it now says bronze.
  - Medium: game canvas text was 10 to 11 world units. Band labels are now 14, so 12px or more on a 360px phone. Record labels are 13, so they fit their 28-unit squares.
  - Medium: FlowDiagram's loop mode, `useInView` and its CSS were dead; draw-once is now the only mode.
  - Medium: dead CSS removed: the medallion loop, `[data-reveal]`, `.enter`, the featured-card toggles, the loop keyframes, and the unused alias tokens (their remaining readers now use the v4 names). The `data-js` head script is removed.
  - Medium: the game's theme observers and its unused palette field are removed.
  - Low: the `ktx2-encoder` dev dependency is removed and the release-check wording updated.
  - Low: `data-flip-id` is renamed `data-lens-item`; the stale Flip test is replaced by fade and no-fade checks.
  - Low: comments are updated.
  - Low: work index figures now use the metal gradient; its focus ring is 1.5px and its labels 13px.
  - Low: the dialog backdrop and the gold band colour are tokens (`--backdrop`, `--metal-light`).
  - Low: the duplicate "Recruiter one-pager" label and the undefined classes are removed.
  - Also: the medallion's hidden dots are removed from the markup.

### Rulings made in Phase W7

- **"Frosted header only" (W7.3)** is read as the banned-list rule: the site header is the only element with `backdrop-filter`. The palette and Ask panels are solid `--surface` with a dark backdrop, which also keeps their text contrast fixed.
- **Hanken weights.** Only 400 and 500 are loaded, so the few `font-semibold` labels left in the `/explore` lenses render synthesised. Left for W8's visual pass.
- **No palette button on phones.** v4 has no header navigation, so phones reach every page from the hub tiles and back pills, Ask from the home and Contact pages, and the game from the 404. The palette stays a keyboard (⌘K, /) convenience.

## Phase W6 checklist

- [x] About: back pill, title, a rounded 4:5 portrait frame, sticky on desktop. It uses `public/images/portrait.jpg` when the build finds it. Until then it shows the reference's outline, marked decorative and without the reference's "Your portrait goes here" text; on phones the empty frame is hidden. The slot is DECISIONS 22.
- [x] Statement in Bodoni, from the reference and fact-checked against 2.1 (merge rules never overwrite good data) and 2.3 (warnings quote the label). Two paragraphs written from 2.4, 2.7, 2.1 and `profile.status` (`src/data/about.ts`).
- [x] Facts grid from data (`facts()`): Education (both degrees, dates and GPA), Certifications (all four), and every skill group with its Cloud subgroups. The runbook's "Data" and "AI and apps" cells are the graph's own groups, so nothing from the v3 Skills or Credentials sections is dropped. The anchors `#credentials` and `#skills` still land; the graph and the Ask panel link to them.
- [x] The medallion diagram from the v3 About page (and the v2 hero before it) stays on About. It is restyled with bronze connectors, rounded steel boxes and Hanken labels, has a visible caption, and is static, because the dot field is the only ambient motion. The v3 Skills section's link to the skill map stays.
- [x] Contact: back pill, title, intro "Hiring for data or AI engineering? {profile.status}." (the reference's "I reply to every message" is a promise, not a fact). The email is in large Bodoni with a bronze underline that draws on hover (`scaleX`), and on phones it wraps after the @ only. The composer has "Write a note", "Copy email" (reports "Email copied" in a status region, with a fallback message) and "Open in my email app", which builds `mailto:` with the subject "Role for a data or AI engineer" and the note as the body (`contact/mailto.ts`). GitHub, LinkedIn and Resume (PDF) come from `profile`, and the resume link uses `withBasePath`. The Ask entry sits under the links.
- [x] Graph: role and event evidence links point to `/experience`, not the gone `/about#experience`. `scripts/build-graph.mts` now knows `/experience` and `/contact` and only the About anchors that exist.
- [x] Tests: `contact/mailto.test.ts` (3); `e2e/v4-about-contact.spec.ts` (About content from data, anchors, diagram and skill-map link, portrait outline, axe; Contact links from profile, the composer mailto subject and body, Copy email, Ask, the email fitting at phone width, axe): 19 passed, 3 skipped. Unit suite 118 passed.
- [x] lint, typecheck, build clean; `npm run verify -- --phase W6 --path /about --path /contact`: all pass. Screenshots in `docs/screenshots/phase-W6/`, inspected at 1280 and 390.
- [x] fact-checker: 42 claims, 42 supported. Its three notes were fixed: the old anchors, the medallion diagram kept, the skill-map link kept.

## Phase W5 checklist

- [x] W5.1 Back pill, "Experience" title, one-line intro "Every role on one timeline. Select a bar to read what happened there." (the reference's "Four years on one axis" has no source; fact-checker).
- [x] W5.2 Chart in a rounded 28px panel (`experience/Timeline.tsx`, data `src/data/experience.ts`): axis labelled 2023 to 2027 (from mid-2022 so the internship shows), lanes Celebal intern, Celebal associate, ASU teaching, ASU Surplus and Milestones (DevHacks win as a rotated diamond), a "Today" line labelled under the axis. Bars are bronze outlines with a 16% fill, solid bronze when hovered or selected; buttons with `aria-expanded` and `aria-controls`. Narrow bars carry their label outside: right of the intern bar, left of ASU Surplus and the milestone (tested: none truncated).
- [x] W5.3 Detail panel (live region): dates, role title in Bodoni, organisation in bronze with the place, the summary, the role’s figures in metal (Celebal: about 50%, about 10 million, about 30%; TA: 40+), every outcome (Celebal’s twelve, with their labels), and the projects built in the role (Surplus AI, WLAN toolkit) or the milestone’s page. Opens on the current role; the server HTML carries it.
- [x] W5.4 The graph has real dates for the Graduate Teaching Assistant role (August 2025 to May 2026), so it has a lane. Education is not on the chart: the M.S. has no start date in the graph and the B.Tech (2019 to 2023) falls mostly before the axis; both are on About. The expected graduation (December 2026) is not drawn: its label would collide with the DevHacks diamond, and About carries it.
- [x] W5.5 Phones: the chart keeps a 700px minimum and scrolls sideways inside its panel; the detail stacks (tested: the page itself does not overflow).
- [x] "Today" uses the build date in the server HTML and the visitor’s date after hydration (`useSyncExternalStore`), so the current role’s bar always ends today.
- [x] Tests: `src/data/experience.test.ts` (9: month maths, labels, axis clamp, lanes and order, graph dates, figures and outcomes kept, intern summary, default selection); `e2e/v4-experience.spec.ts` (bars, axis and Today; default role in the server HTML; selecting a bar; keyboard and the milestone; outside labels untruncated; phone scroll; axe): 12 passed, 2 skipped. All v4 specs 102 passed; unit suite 115 passed.
- [x] lint, typecheck, build clean; `npm run verify -- --phase W5 --path /experience`: all pass; screenshots in `docs/screenshots/phase-W5/`, inspected at 1440 (beside the reference shot) and 390.
- [x] fact-checker: 64 claims, 63 supported, 1 unsupported ("Four years on one axis", replaced). Apostrophe conversions confirmed wording-identical.

### Rulings made in Phase W5

- The v3 `Experience` list component stays until W7 (it is no longer routed); `/explore`’s Timeline lens also shows the roles.

## Phase W4 checklist

G5 answered `approve` on 2026-11-01 (DECISIONS 21): every listed difference accepted; continue without stops until G1.

- [x] W4.1 Back pill "All work" (`/work`) on every project page.
- [x] W4.2 Band (featured four): the catalogue's art plate, 28px radius, `min(56vh, 520px)` (phones `min(44svh, 360px)` so the one-liner and first link are in the first screen), kicker and Bodoni name at the bottom. Kicker from the catalogue (`work.ts`); DevHacks uses "Cooked won first place, Track 1" so it does not repeat its own title (facts 2.2). A shade over the lower band keeps the text readable: pixel-sampled at the brightest pixel behind the text on all four plates at 1440 and 390, kicker ≥ 5.63:1 and title ≥ 7.84:1 (worst case DevHacks' bronze conic plate).
- [x] W4.3 Results: up to three rounded tiles (24px, tile tokens), metal-gradient number and one-line label from the graph's metrics; every project has three or fewer, so nothing is dropped.
- [x] W4.4 What it does: two columns (heading left third), the built paragraph and the highlights as ruled bullets, then the details grid (Surplus AI "How it works").
- [x] W4.5 How it’s built: the v3 diagrams restyled (thin steel boxes at 10px radius, bronze connectors, arrows and dots, Hanken labels, rounded 28px panel) with title and description in the SVG and the caption under it. Draw once on scroll-in; finished and static with reduced motion and without JavaScript (both tested). GSAP no longer used by the diagrams.
- [x] W4.6 Stack as pills with status notes (live dot for running), credit and status detail; links as buttons (first solid) in the intro, so the live app and repos are in the first screen.
- [x] W4.7 Next project: "Next project" label and large Bodoni name (italic on hover), looping through the featured four (Watchtower → Surplus AI); the seven smaller projects loop among themselves. Named by the project’s own title.
- [x] W4.8 DevHacks × Cubbie keeps Cooked (winner), Receipts and Bailout as tiles, each with its repository (Bailout has none). Smaller projects: compact header (kicker + title), no band art, same sections when the graph has data.
- [x] W4.9 fact-checker over all eleven pages: 118 claims, 118 supported, verdict CLEAN.
- [x] Tests: `src/data/project-page.test.ts` (7: both loops, next name, unknown slug, every page builds, DevHacks kicker); `e2e/v4-project.spec.ts` (every page: title, back pill, one-liner, result count, band only on featured, sections only with data, next link; Watchtower loops to Surplus AI; DevHacks entries; Label Lens screenshot and live link; Surplus three diagrams static under reduced motion; no-JS finished drawing; draw on entry with motion; axe on four pages): 40 passed on desktop and phone. All v4 specs 91 passed, 13 skipped (device-specific). Unit suite 106 passed. `e2e/case.spec.ts` (v3 template) removed with the template.
- [x] lint, typecheck, build clean. `npm run verify -- --phase W4` over all eleven `/work/<slug>` routes: all pass (axe 0, console 0, failed requests 0, overflow 0); dark screenshots in `docs/screenshots/phase-W4/`. Inspected 1440 (Surplus AI, F1) and 390 (DevHacks, Label Lens fold).
- [x] fe-reviewer: 1 High (band text contrast on light plates; fixed and measured), Mediums fixed (result tiles on tile tokens, problem tags 44px tall, draw threshold matched to the observer), Lows fixed (easing token on the diagram fades, box outline alpha .26 → .40, screenshot lazy, unused page fields removed, dead `flow-label` class, draw hook moved to `src/hooks/`, Stack test includes `statusDetail`, no-JS test added). `/code-review` on the diff: no Critical or High.

### Rulings made in Phase W4

- **Result tiles keep the figure's summary line** under the label, smaller and muted. Several summaries carry facts found nowhere else on the page (F1 "52% top-1 against a 43% baseline", the capstone's "250 SKU and warehouse series", the Watchtower agent names), and rule 4 forbids dropping content.
- **Typographic apostrophes in the graph.** Seventeen strings in `src/data/graph/` and the diagram captions used straight apostrophes ("user's", "won't"); they are now ’ as the copy rules require. Wording unchanged; `graph.json` and the search index regenerate at build.
- **Diagram draw uses `stroke-dashoffset`**, the one exception to "transform and opacity only", because the runbook asks the diagrams to draw (recorded in `motion-system`).
- **Sections added beyond the reference's template** because the graph has the content: "The problem" (with the named problems linking to `/explore`'s By problem view) and "Stack". The Label Lens screenshot sits under the results.
- **Explore still uses the v3 looping diagrams and covers** until W7.

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

### Follow-up after W9: Work catalogue gestures and autoplay (owner's request, before G1)

Asked for before merging: the trackpad swipe did nothing (each wheel event was judged alone against a 12px threshold, and Mac trackpads send many small deltas), plus a live swipe animation and autoplay. This supersedes runbook W3.3's "60px threshold, one card per wheel gesture" input rules.

- [x] Trackpad: horizontal deltaX accumulates across the gesture, 120 ms idle ends it; axis decided by the first event and held (vertical passes to the page); `data-lenis-prevent-horizontal` and `stopPropagation` keep Lenis out of horizontal gestures.
- [x] Live motion: drag, touch swipe and trackpad follow 1:1 with the neighbour sliding in; resistance past 0.75 of a card, capped below one; advance past 20% or above 0.5 px/ms (and more than 8 px), else spring back; 700 ms commit on `--ease`; cards dip to about 0.955 mid-slide; art parallax; transform and opacity only; a drag over 8 px is not a click.
- [x] Autoplay: 5 s, looping; the current pill fills as the timer; holds on hover, gestures, hidden tab, off screen, 8 s after any manual move or drag; keyboard focus or the pause button stops it until play; none under reduced motion.
- [x] Arrows, pills, keys and click-to-open unchanged (tests).
- [x] Tests: `e2e/v4-catalogue.spec.ts` (new, motion on): small wheel deltas advance exactly one card (and a long swipe still one), the cards follow a wheel gesture, vertical wheel scrolls the page, sideways drift in a vertical gesture does nothing, a slow 100px drag follows 1:1 and springs back without opening, a short flick advances, blur mid-drag recovers, autoplay after 5 s and not before, hover hold, pause button, keyboard focus pause, 8 s hold, hidden tab, pill fill, reduced motion has neither autoplay nor control. Unit tests for resist, velocity, releaseStep, cardPose and the easing.
- [x] Checks: lint, typecheck, unit 115 passed; Playwright Chrome 285 passed / 51 skipped, WebKit 279 passed / 57 skipped; `npm run verify -- --phase W9-catalogue` passed (`/work`, `/`). A touch swipe sent through CDP on a Pixel 7 profile advanced one card; mid-drag screenshots checked.
- [x] Budget: `/work` module JS 155 kB gzip (unchanged). Lighthouse median of 3: `/work` mobile 92, desktop 100; `/` mobile 95, desktop 100; accessibility 100, CLS 0.
- [x] fe-reviewer: 1 High (a drag left stranded if the release never arrives) and the Mediums (touch axis check, vertical wheel lock, Lenis leak on diagonals, tap-flick, uncapped resistance) fixed; Lows fixed except caching card nodes for paint (4 cards; noted).
