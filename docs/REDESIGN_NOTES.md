# Redesign notes: Phase 0 baseline

Inspection of the repo as it stands on `redesign/v2` (branched from `main` at `78d7a7b`) on 2026-10-29. No code was changed in this phase.

## 1. Stack

| Item | Finding |
|------|---------|
| Framework | Next.js 16.3.8 (Turbopack), React 19.2.8, TypeScript 5 (strict) |
| Router | App Router (`src/app/`). One route, `/`, plus the default `_not-found` |
| Rendering | Fully static. Every component is a Server Component. No `"use client"` anywhere, so the page ships no component JavaScript of its own |
| Styling | Tailwind CSS v4 via `@tailwindcss/postcss`. No `tailwind.config.*`; theme tokens are CSS custom properties in `src/app/globals.css` mapped to utilities with `@theme inline` (`bg-bg`, `text-ink`, `text-muted`, `border-line`, `bg-accent`, `bg-tag`, ...). Dark is default; light follows `prefers-color-scheme` or `data-theme` on `<html>` |
| Fonts | `next/font/google`, self-hosted at build: Space Grotesk 500/600 (`--font-space-grotesk`, headings), IBM Plex Sans 400/500/600 (`--font-plex-sans`, body), IBM Plex Mono 400/500 (`--font-plex-mono`, dates and tags). `display: swap` |
| Animation | None as a library. Pure CSS in `globals.css`: `.draw-line` / `.draw-appear` (hero SVG draws once on load, staggered by a `--d` custom property) and `.reveal` (scroll-driven `animation-timeline: view()`, feature-gated with `@supports`). All of it is disabled under `prefers-reduced-motion` |
| Icons | `@phosphor-icons/react` imported from `/dist/ssr` (server-safe, tree-shaken per icon) |
| Images | None. There is no `<img>` or `next/image` on the page. All visuals are inline SVG or semantic HTML diagrams. `images.unoptimized: true` is set for export compatibility anyway |
| Content | One typed data file, `src/content/portfolio.ts` (328 lines). Every string on the page comes from it. Components contain no copy except structural labels ("Problem", "Status", "Stack", nav labels) |
| Design spec | `DESIGN.md` (repo root) documents tokens, type scale, component rules, do's and don'ts. `PORTFOLIO_BRIEF.md` is the content source of truth but is gitignored, so it exists only locally |
| Tests | Playwright (`e2e/home.spec.ts`) with `@axe-core/playwright`: content assertions, WCAG 2.2 AA axe scans per section, copy rules (no em/en dashes, banned words), no horizontal scroll, and screenshot baselines for hero, featured work, experience at desktop dark, desktop light, mobile dark |

## 2. Build and deploy

### Config

`next.config.ts`:

```ts
output: "export",
images: { unoptimized: true },
```

No `basePath`, no `assetPrefix`, no `trailingSlash` in the repo. See below for why that still works.

### Scripts (`package.json`)

| Script | Command |
|--------|---------|
| `dev` | `next dev` |
| `build` | `next build` (writes `out/`) |
| `start` | `next start` (not usable with `output: "export"`; harmless leftover from the template) |
| `lint` | `eslint` |
| `test:e2e` | `playwright test` (builds, serves `out/` on port 4321, runs the suite against the real export) |
| `test:e2e:update` | same, regenerating screenshots |

### How a push becomes a live site today

1. Push to `main` triggers `.github/workflows/nextjs.yml` ("Deploy Next.js site to Pages"), the stock GitHub starter workflow. It also has `workflow_dispatch`.
2. `actions/configure-pages@v5` runs with `static_site_generator: next`. That step rewrites `next.config.ts` inside the runner to inject `basePath: "/srujan-portfolio"` and `images.unoptimized: true`. This is why the repo has no `basePath` but the live HTML references `/srujan-portfolio/_next/...`.
3. `npm ci`, then `npx --no-install next build` on Node 20 (we run Node 22 locally; build passes on both).
4. `actions/upload-pages-artifact@v3` uploads `./out`, and `actions/deploy-pages@v5` publishes it. The repo's Pages setting is `build_type: workflow`, so there is no `gh-pages` branch and no `docs/` folder. Jekyll never runs on artifact deploys, so `_next/` (leading underscore) is served fine and no `.nojekyll` is needed; there is none in the repo or in `out/`.
5. Live URL: https://srujanrudrapati.github.io/srujan-portfolio/ (verified 200, assets 200, unknown paths return the exported `404.html`). Last run: `37146615841`, success, 2026-10-03.

Two consequences of the injected `basePath` to keep in mind during the redesign:

- **Local and CI differ.** Local dev is `http://localhost:3000/` (no prefix). Local `out/` has no prefix either. Only the CI build has `/srujan-portfolio`. The Playwright suite therefore tests a slightly different artifact than what deploys.
- **Plain string hrefs are not rewritten.** `basePath` only affects `next/link`, `next/image`, and Next's own asset URLs. `profile.resume = "/resume.pdf"` is rendered as a raw `<a href="/resume.pdf">`, so on the live site it points at `srujanrudrapati.github.io/resume.pdf`, which is 404. The file is also missing: `public/` is empty, so even `/srujan-portfolio/resume.pdf` is 404. **Both "Download Resume" and the nav "Resume" button are broken in production.**

### Branch state found at start

Local `main` was one commit behind `origin/main`; the missing commit (`78d7a7b`) is the deploy workflow itself. Local `main` was fast-forwarded and `redesign/v2` (which had no commits yet) was re-pointed onto it so the redesign branch carries the workflow. No other git changes.

## 3. Local run

| Check | Result |
|-------|--------|
| `npm install` | clean, 0 changes to lockfile. `npm audit --omit=dev` reports 1 critical in `next` 16.3.8 (image optimizer SVG RCE, Server Actions DoS, `use cache` RCE). None of the three code paths exist in a static export, but `next@16.4.3` fixes them and is a non-breaking bump |
| `npm run dev` | ready in ~350 ms at **http://localhost:3000/** (no basePath locally, so the URL is plain) |
| `npm run lint` | 0 warnings, 0 errors |
| `npm run build` | succeeds in ~6 s. Output: `out/` (1.5 MB): `index.html` (168 KB, includes inlined font CSS and all markup), `404.html`, `_not-found.html`, `favicon.ico`, `_next/static/...`, plus RSC payload files `index.txt`, `__next.__PAGE__.txt`, `__next._full.txt`, `__next._tree.txt` |
| Browser console on `/` (headless Chrome, full scroll) | no warnings, no errors, no failed requests, no 4xx |

## 4. Source tree (`src`, depth 3)

```
src
├── app
│   ├── favicon.ico
│   ├── globals.css        142 lines  tokens, @theme inline, base styles, motion keyframes
│   ├── layout.tsx          49 lines  fonts, metadata, theme-color, <html>/<body>
│   └── page.tsx            33 lines  skip link, header, section order, footer
├── components
│   ├── About.tsx           10 lines
│   ├── Contact.tsx         48 lines
│   ├── Credentials.tsx     45 lines
│   ├── diagrams.tsx       183 lines
│   ├── Experience.tsx      59 lines
│   ├── FeaturedWork.tsx   129 lines
│   ├── Hero.tsx           115 lines
│   ├── HeroDiagram.tsx    101 lines
│   ├── OtherProjects.tsx   58 lines
│   ├── Skills.tsx          35 lines
│   └── ui.tsx              78 lines
└── content
    └── portfolio.ts       328 lines
```

Untracked clutter: `src/.DS_Store` (ignored by `.gitignore`, present on disk).

## 5. Components, one line each

| File | Exports | Renders |
|------|---------|---------|
| `app/layout.tsx` | `RootLayout`, `metadata`, `viewport` | `<html lang="en">` with the three font variables, `theme-color` for dark/light, `<body class="min-h-dvh">` |
| `app/page.tsx` | `Home` | Skip link, `SiteHeader`, `<main id="main">` with the eight sections in order, `SiteFooter` |
| `ui.tsx` | `Container` | Centered `max-w-[1200px]` wrapper with responsive gutters |
| `ui.tsx` | `Section` | `<section id aria-labelledby>` with top hairline, `h2`, optional intro, children |
| `ui.tsx` | `TagList` | Labelled `<ul>` of mono, `translate="no"` tag chips |
| `ui.tsx` | `TextLink` | Accent underlined link; external variant adds `target=_blank rel=noopener` |
| `Hero.tsx` | `SiteHeader` | Sticky blurred top bar: name, nav (Work, Experience, Skills, Contact, hidden under `md`), outline Resume download button |
| `Hero.tsx` | `Hero` | `h1` headline, sub-line, primary Download Resume button, GitHub / LinkedIn / Email icon links, `HeroDiagram` in a 7/5 split |
| `HeroDiagram.tsx` | `HeroDiagram` | Inline SVG (`role="img"`, `<title>` + `<desc>`): source systems, bronze/silver/gold, serving layer, LLMs and agents, with CSS draw-on animation |
| `About.tsx` | `About` | One large paragraph built by joining the four `about` sentences |
| `FeaturedWork.tsx` | `FeaturedWork` | Two case-study `<article>`s: Surplus AI (header, problem/built, pipeline diagram, network + privacy diagrams, "How it works" `<dl>` of six parts, status badges, stack) and Watchtower (header, agent-flow diagram, problem/built, status, stack) |
| `diagrams.tsx` | `SurplusPipelineDiagram` | `<figure>` with an `<ol>` of nodes and decorative arrows: two inputs, then lookup, inventory, LLM, listings |
| `diagrams.tsx` | `NetworkDiagram` | Internet (no uplink) over a gigabit switch over five node cards with IPs and a pending marker |
| `diagrams.tsx` | `PrivacyLayersDiagram` | Four nested boxes (outermost first) around a "Surplus AI" core |
| `diagrams.tsx` | `AgentFlowDiagram` | Input, three agents, RAG tool hanging off agent 2, output |
| `OtherProjects.tsx` | `OtherProjects` | Six project cards on a staggered 7/5, 5/7, 6/6 grid: meta, title, optional key figure, outcome, optional credit, stack tags, optional View Repo link |
| `Experience.tsx` | `Experience` | Three roles; sticky meta column (dates, title, org, place) and outcomes as tick list or, for Celebal, a two-column labelled grid of nine engagements |
| `Skills.tsx` | `Skills` | Six skill groups in a 3-column grid; Cloud group uses a `<dl>` for Azure / AWS / Other |
| `Credentials.tsx` | `Credentials` | Two columns: four certifications with a certificate icon, two degrees with a graduation-cap icon, dates and GPA |
| `Contact.tsx` | `Contact` | `h2`, availability line, large `mailto:` email link, LinkedIn link |
| `Contact.tsx` | `SiteFooter` | Copyright left, location right |

## 6. Sections in page order

1. Skip link ("Skip to content" to `#main`)
2. `SiteHeader` (sticky)
3. `#top` Hero
4. `#about` About
5. `#work` Featured work: Surplus AI, then Autonomous Supply Chain Watchtower
6. `#projects` Other projects (6 cards)
7. `#experience` Experience (3 roles)
8. `#skills` Skills (6 groups)
9. `#credentials` Certifications and education
10. `#contact` Contact
11. Footer

Heading outline is clean and in order: one `h1`, eight `h2`, `h3`/`h4` nested correctly (verified in the browser).

## 7. Dependencies and why they are there

Runtime:

| Package | Why |
|---------|-----|
| `next` 16.3.8 | Framework, static export |
| `react`, `react-dom` 19.2.8 | Required by Next |
| `@phosphor-icons/react` | The ten icons used (download, GitHub, LinkedIn, envelope, arrow-right, arrow-up-right, X, certificate, graduation cap). Imported from `/dist/ssr` so they render on the server with no client bundle |

Dev only:

| Package | Why |
|---------|-----|
| `tailwindcss` 4, `@tailwindcss/postcss` | Styling |
| `typescript`, `@types/node`, `@types/react`, `@types/react-dom` | Types |
| `eslint` 9, `eslint-config-next` | Lint (`core-web-vitals` + `typescript` presets) |
| `@playwright/test` | E2E and visual regression |
| `@axe-core/playwright` | Accessibility assertions in the E2E suite |
| `serve` | Serves `out/` for the Playwright `webServer` so tests hit the real export |

Nothing unused. No UI kit, no animation runtime, no analytics.

## 8. Oddities and things to decide

**Broken in production**

- `public/` is empty; `resume.pdf` does not exist. Combined with the raw `href="/resume.pdf"` ignoring the injected `basePath`, both resume links 404 on the live site (verified). Needs the file and a basePath-aware href (or a `NEXT_PUBLIC_BASE_PATH` env read in `portfolio.ts`).

**Config and tooling**

- `basePath` lives only in the CI step, not in the repo. Any new absolute `href`/`src` string (not via `next/link` or `next/image`) will break the same way. Worth considering moving `basePath` into `next.config.ts` behind an env check so local build matches CI.
- `next` 16.3.8 has a critical advisory; `16.4.3` is the fix. Not exploitable in a static export, but a free upgrade.
- `start` script is dead for an export build.
- `.next/`, `out/`, `tsconfig.tsbuildinfo`, `test-results/` exist on disk and are correctly gitignored.
- `PORTFOLIO_BRIEF.md` (the content source of truth) is gitignored, so it is not on GitHub. `DESIGN.md` and `portfolio.ts` both point at it.
- `AGENTS.md` is the auto-generated Next 16 notice; `CLAUDE.md` just includes it.

**Code**

- Inline `style={}` appears only in `HeroDiagram.tsx`: `--d` animation delays and `fontFamily: var(...)` on SVG `<text>` (SVG text cannot take the Tailwind font utilities the same way). Acceptable, but note it.
- Hardcoded hex outside `globals.css`: only the two `theme-color` values in `layout.tsx` (`#0e1a2b`, `#f3f6fa`), which duplicate `--bg`. Nothing else.
- `Section` has an `intro` prop that no caller uses.
- `Contact` reimplements the `Section` wrapper by hand instead of using `Section`; it also inlines its own LinkedIn link styles instead of `TextLink`.
- `OtherProjects` wraps the date in `<time>` without a `datetime` attribute, so it adds nothing semantically.
- Watchtower has a `repo: null` field that is never read by the component (only `otherProjects` render repo links). Six of seven projects have `repo: null // TODO`.
- `profile.githubLabel` is defined but unused.
- `about` is an array of sentences that `About.tsx` joins into one paragraph, so the array shape is unused.
- `DESIGN.md` says the nav reads "Projects, Experience, Skills, Contact"; the code says "Work, Experience, Skills, Contact" and links to `#work`. There is no nav link to `#projects`, `#about`, or `#credentials`.
- `DESIGN.md` mentions `loading="lazy"` for images, but there are no images.

**Accessibility (console and Lighthouse)**

- Console: clean. Axe (via the E2E suite) is wired to WCAG 2.2 AA and currently passes.
- Lighthouse flags one `label-content-name-mismatch`: the "View Repo" link has `aria-label="View End-to-End CI/CD Deployment Pipeline repository on GitHub"` while its visible text is "View Repo". The visible text is not contained in the accessible name, which trips voice-control users. Fix by making the label start with the visible text ("View Repo: ...") or by using visually hidden text instead of `aria-label`.
- No images, so no alt-text issues. Diagrams have `<title>`/`<desc>` or `aria-label` groups.

**Alt text / images**

- None to audit; no `<img>` elements exist.

## 9. Lighthouse baseline (Lighthouse 12, headless Chrome, 2026-10-29)

Run against the production static export served locally with `npx serve out -l 4321` (the same artifact the workflow deploys, minus the basePath prefix). The dev server was also measured for reference.

| Target | Performance | Accessibility | Best Practices | SEO |
|--------|-------------|---------------|----------------|-----|
| **Static export, desktop preset** (baseline) | **100** | **100** | **100** | **100** |
| Static export, mobile (default preset) | 97 | 100 | 100 | 100 |
| Dev server `localhost:3000`, desktop preset | 100 | 100 | 100 | 100 |

Desktop metrics (static export): FCP 0.3 s, LCP 0.6 s, TBT 0 ms, CLS 0, Speed Index 0.6 s.
Mobile metrics (static export): FCP 0.9 s, LCP 2.7 s, TBT 30 ms, CLS 0.

Non-scoring notes from the report: ~55 KiB of unused JavaScript across two Next runtime chunks (framework overhead, not app code), and `serve` sends no long cache headers (irrelevant on GitHub Pages, which sets its own).

Raw reports are not committed. Re-run with:

```sh
npm run build && npx serve out -l 4321 --no-clipboard &
npx lighthouse@12 http://localhost:4321/ --preset=desktop --view
```

---

# Phase 1: design direction

Three directions, built on the same content, the same sample project card (F1 Race Outcome Predictor, chosen because it has a headline figure) and the same medallion diagram, so only the design changes between them. They are rendered side by side, light and dark, at `/design-preview` (throwaway route, `robots: noindex`, not linked from the nav). Fonts for the preview are loaded by that route only; the live page is untouched.

Shared rule for all three: the brief's bans stand (no purple or blue gradient heroes, no glass cards, no neon grids, no stock tech imagery). Bronze, silver and gold appear as literal metal tints only inside the medallion diagram, never elsewhere.

## A. Lab notebook

**Feel.** A careful engineer's ledger: warm paper, ink, and nothing that was not written down for a reason. In three seconds a recruiter senses "this person documents their work."

**Palette.**

| Role | Light | Dark | Used for |
|------|-------|------|----------|
| Background | `#F2EDE3` | `#1C1915` | Page |
| Surface | `#E9E2D3` | `#262219` | Cards, diagram panels |
| Text | `#1C1A16` | `#EEE7D9` | Headings and body |
| Muted | `#5B5648` | `#A89F8E` | Captions, dates, secondary copy |
| Accent (ink blue) | `#24419A` | `#9DB1F0` | Links, diagram flow lines and arrows, the LLM node |
| Accent 2 (red pencil) | `#B2442A` | `#E58B6A` | Impact numbers, status marks, "in progress" rings |

Contrast on background: text 14.9 / 14.2, muted 6.3 / 6.7, accent 7.8 / 8.3, accent 2 4.8 / 6.9 (light / dark). All AA; accent 2 is used at large sizes only in light mode.

**Typography.** Newsreader (Google, variable with optical size) at weight 500 for display, italic for the one-line feel statements; IBM Plex Sans 400/500 for body and for numbers (tabular). Two families. Newsreader's optical-size axis means the same face reads crisp at 13px in a diagram and generous at 60px in the hero, so no third face is needed. Plex Sans is already loaded on the site.

**Motion.** Almost none. Links and buttons change color; the hero diagram still draws once on load; nothing else moves.

**Medallion diagram.** A row of ledger cells on faintly ruled paper. Each cell has a small square metal stamp (bronze, silver, gold) above its name, cells are joined by a thin ink rule ending in a dot, and the LLM cell closes with a double rule, the way a ledger marks a total.

**Risk.** Warm paper plus a serif is the most familiar "editorial portfolio" look right now, and it can read as a writer's site rather than an engineer's. The ink and red-pencil pair, and the diagrams, have to carry the engineering signal.

## B. Night shift

**Feel.** A control room at 2 a.m.: dark petrol, one hot signal, and every stage reporting its state. A recruiter senses "this person runs systems in production."

**Palette.**

| Role | Light | Dark (default) | Used for |
|------|-------|----------------|----------|
| Background | `#F3F6F6` | `#0F1C21` | Page |
| Surface | `#E6ECEC` | `#16272E` | Cards, nodes |
| Text | `#101C20` | `#E6EEF0` | Headings and body |
| Muted | `#4C5E64` | `#8FA6AE` | Captions, connectors, secondary copy |
| Accent (hot orange) | `#B03A04` | `#FF8A3D` | Links, impact numbers, the active stage, the primary button |
| Accent 2 (mint) | `#1D7A5C` | `#5FD3A6` | Healthy status dots only, never text or decoration |

Contrast on background: text 16.0 / 14.8, muted 6.2 / 6.8, accent 5.6 / 7.4, accent 2 4.8 / 9.4. All AA.

**Typography.** Martian Mono (Google, variable) 500/600 for display, labels and numbers; Hanken Grotesk 400/500 for body. Two families. Martian Mono is wide and heavy enough to work as a headline face, which is unusual for a monospace, and it makes the dates, IPs and stack tags read as instrumentation rather than decoration. Hanken Grotesk is neutral and tall-x-height so paragraphs stay readable next to the mono.

**Motion.** Quiet and continuous: a single small pulse travels along each pipeline connector on a loop, status dots do not animate, and everything is static under reduced motion.

**Medallion diagram.** A pipeline run view. Each stage is a node with a colored left bar (bronze, silver, gold, orange for the LLM), a lowercase mono name, a short sub-label, and a status line ("ok" with a mint dot; "running" with an orange dot on the LLM). Dotted connectors carry the traveling pulse.

**Risk.** Dark plus monospace is the most common engineer-portfolio look, so the execution has to be sharp or it reads as a template. It is also the closest to the current site, which limits how much a redesign is felt.

## C. Spec sheet

**Feel.** A datasheet for a person: bright, exact, strong type on a visible grid, no decoration at all. A recruiter senses "precise, confident, easy to scan."

**Palette.**

| Role | Light (default) | Dark | Used for |
|------|-----------------|------|----------|
| Background | `#F6F6F3` | `#161616` | Page |
| Surface | `#EBEBE6` | `#202020` | Cards |
| Text | `#0A0A0A` | `#F2F2EE` | Headings and body (body is full-strength text, not muted) |
| Muted | `#55554F` | `#A3A39B` | Dates, captions only |
| Accent (red) | `#C42A14` | `#FF6A4E` | Impact numbers and the one primary button |
| Accent 2 (cobalt) | `#1B4FD8` | `#7F9CFF` | Links, diagram flow, the LLM tile |

Contrast on background: text 18.3 / 16.1, muted 6.9 / 7.1, accent 5.1 / 6.4, accent 2 6.1 / 7.0. All AA.

**Typography.** Archivo only (Google, variable with a width axis). Headlines and figures at weight 700 and 125% width, body at 400/500 at normal width, numbers tabular. One family doing two jobs through width, which is what makes it feel designed rather than defaulted.

**Motion.** Quick and snappy: 120ms color and underline changes on hover and focus, nothing on scroll, and only the hero diagram draws on load.

**Medallion diagram.** A strip of flat tiles that touch, separated by 2px black rules inside a 2px black frame: an outlined Source tile, then bronze, silver and gold tiles with black text, then a cobalt LLM tile with white text. No arrows; the strip itself is the sequence.

**Risk.** Bright Swiss layouts can feel cold or corporate, and the expanded display width is loud at hero size. It needs discipline in spacing and a hard cap on how often red appears, or the page tips from "precise" into "shouty."

## Recommendation: C, Spec sheet

The content on this site is specific and technical, and the diagrams are the best thing on it. Spec sheet is the direction that makes those the hero: light background, black type, color only where it means something (red for a number, cobalt for flow). It reads as an engineer's datasheet rather than a designer's portfolio, and it is the one of the three that does not look like the current crop of engineer sites, which are overwhelmingly dark with monospace labels. Light-by-default also holds up where recruiters actually look: a laptop tab next to a job description, a screenshot in a message.

Two things to borrow from the others when building it: Night shift's status vocabulary (a dot plus a word, never a dot alone) for the Surplus AI "running / in progress" badges, and Lab notebook's restraint on motion.

If you want the site to keep its current dark-first identity, Night shift is the safer evolution and keeps most of the existing tokens.

## Preview

- URL: `http://localhost:3000/design-preview`
- Files: `src/app/design-preview/page.tsx`, `src/app/design-preview/preview.module.css`
- Verified: typecheck and lint clean, no console errors, no horizontal overflow at 1440 or 390 wide, static export writes the route to `out/design-preview.html`.
