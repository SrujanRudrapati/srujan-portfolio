# v3 information architecture (Phase V3)

The fix for "too much on one page": the v2 single page is split into routes. Nothing was deleted; every v2 section now lives on at least one route. Until V4 rebuilds the home page as the short pipeline story, `/` still carries all the v2 sections as well, so for now each section is in two places.

## Routes

| Route | Purpose | Built from |
|---|---|---|
| `/` | Short scroll story (V4). Until then: the v2 sections, unchanged | `src/app/page.tsx` |
| `/work` | Every project, featured large then compact, filterable (All, Production, AI/LLM, Data engineering, Hackathon) | `WorkExplorer` |
| `/work/[slug]` | One page per project, 11 statically generated from the graph (`generateStaticParams`, `dynamicParams = false`). V5 makes this the case-study template | `FeaturedCard` (all fields, no self-link) |
| `/explore` | The v2 lenses: Highlights, Timeline, Skill map, By problem, By industry, Recruiter (logic unchanged; `#lens=<id>` still selects) | `Explore` + `WorkExplorer` |
| `/about` | Bio, experience, skills, certifications and education | `About`, `Experience`, `Skills`, `Credentials` |
| `/cv` | Recruiter mode one-pager with the resume download; prints to one page | `RecruiterLens` (print rule `body:has(main[data-print="cv"])`) |
| 404 | `Row not found`: the query that returned no row, then links to every page. The mini-game joins it in V6 | `src/app/not-found.tsx` |

Global, in the root layout on every page: the skip link, the nav (name, Work 1, Explore 2, About 3, CV 4, Resume, theme on desktop, the palette button), the footer (email, GitHub, LinkedIn, resume), the command palette, the Ask panel, and `MotionRoot` (smooth scroll, transitions, intro, the shared 3D stage).

## Old section → new route (every item checked)

| v2 section or element | v3 location | Check |
|---|---|---|
| Sticky nav: name, About, Work, Experience, Skills, Contact, Ask, Resume, theme toggle, phone menu | Nav (pages instead of sections; Resume; theme on desktop) + command palette (pages, projects, Ask, theme, copy email, resume; it is the phone menu) | [x] |
| Skip to content | Root layout, every page | [x] |
| Hero: headline, sub-line, status, three calls to action, proof chips, medallion diagram, Ask box | `/` (V4 rebuilds it); "See my work" now goes to `/work`, "One-page summary" to `/cv`, "Get in touch" to `#contact` on `/` | [x] |
| About | `/about`, and `/` until V4 | [x] |
| Work: lens switcher, filters, four featured cards with figures, diagrams, details, seven compact cards | `/work` (featured, compact, filters), `/explore` (lens switcher, Highlights = the same cards), `/work/[slug]` (each card's full content) | [x] |
| Featured card details ("How it works", secondary diagrams, status notes, stack, links) | `/work/[slug]` and the cards on `/work` | [x] |
| Compact card's primary external link (live app, repo or write-up) | The card now opens `/work/[slug]`; the external links are on that page | [x] |
| Experience (four roles, link to the timeline) | `/about#experience`; the link goes to `/explore#lens=timeline` | [x] |
| Skills (groups, link to the skill map) | `/about#skills`; the link goes to `/explore#lens=skills` | [x] |
| Certifications and education | `/about#credentials`, and on `/cv` | [x] |
| Contact (email, LinkedIn, GitHub, resume) | `#contact` on `/` (V4's `stage 04 / query`), and the footer on every page | [x] |
| Footer (copyright, location, "Built with Next.js") | Global footer | [x] |
| "Back to top" footer link | Replaced by the nav (fixed, always visible) and the palette; no content lost | [x] |
| Ask Srujan panel | Global; opened from the palette ("Ask about my work", or any typed question) and from the home Ask box | [x] |
| Recruiter lens and its print view | `/cv` (one page) and still a lens on `/explore` | [x] |

Replaced chrome (code, not content): `SiteNav.tsx` and its hooks (`use-active-section`, `use-mobile-menu`, `use-scrolled`), `AskButton.tsx` and the v2 `SiteFooter` were removed after the new nav, palette and footer took over everything they did.

## Links and evidence

- Graph evidence URLs are pages now: `#project-<slug>` → `/work/<slug>`, `#work` → `/work`, `#experience` → `/about#experience`, `#credentials` → `/about#credentials`, `#skills` → `/about#skills`, `#lens=<id>` → `/explore#lens=<id>`. They are stored without the GitHub Pages prefix and rendered through `withBasePath`.
- `scripts/build-graph.mts` rejects bare `#fragment` evidence, unknown project slugs, unknown lenses, unknown `/about` anchors and files missing from `public/`.
- Ask answers link to pages (`anchorFor` in `src/lib/ask/answer.ts`, tested in `answer-links.test.ts`); clicking one closes the panel and the route transition scrolls to the anchor and focuses it.
- Lens items (Timeline, By problem, By industry, Recruiter) link to `/work/<slug>`.

## Tokens (v3, `src/app/globals.css`)

Two neutrals and one accent; the v2 token names stay so every component keeps working, with `--accent` and `--accent-2` now the same blue (C's red is gone). AA contrast, computed:

| Pair | Light | Dark |
|---|---|---|
| Text on page | 21.00 | 21.00 |
| Text on surface | 18.76 | 18.42 |
| Muted on page | 6.69 | 8.33 |
| Muted on surface | 5.97 | 7.30 |
| Accent on page | 6.70 | 7.99 |
| Accent on surface | 5.99 | 7.01 |
| Label on accent fill | 6.70 | 7.99 |
| Hairline on page (decorative only) | 1.41 | 1.48 |

Light: page `#ffffff`, surface `#f2f2f2`, raised `#ffffff`, hairline `#d9d9d9`, text `#000000`, muted `#5c5c5c`, accent `#1d4ed8` (hover `#1e40af`). Dark: page `#000000`, surface `#141414`, raised `#1c1c1c`, hairline `#2b2b2b`, text `#ffffff`, muted `#a3a3a3`, accent `#7c9bff` (hover `#9db3ff`). Medallion data states: bronze `#9a5f35`/`#d08b57`, silver `#7c838b`/`#b5bcc3`, gold `#9c7a1c`/`#e0b84a`.
