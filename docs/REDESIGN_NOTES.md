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

---

# Phase 2: design system (Spec sheet)

Chosen direction: **C, Spec sheet**, as proposed in Phase 1 with no palette changes. The site now wears the new skin on the old layout; no section was restructured. Content is untouched.

## Tokens (`src/app/globals.css`)

One colour system. Runtime-switchable colours live on `:root` as plain custom properties; the `@theme inline` block maps each one to a Tailwind utility name, so there is no second palette in a config file (Tailwind v4 has no `tailwind.config`; `@theme` is its equivalent). Everything that does not change with theme is declared once in `@theme` and is available both as a utility and as a CSS variable.

| Token | Utility | Light | Dark |
|-------|---------|-------|------|
| `--bg` | `bg-bg` | `#F6F6F3` | `#161616` |
| `--surface` | `bg-surface` | `#EBEBE6` | `#202020` |
| `--surface-raised` | `bg-raised` | `#FDFDFB` | `#262626` |
| `--border` | `border-line` | `#CFCFC8` | `#3A3A36` |
| `--text` | `text-ink` / `border-ink` | `#0A0A0A` | `#F2F2EE` |
| `--text-muted` | `text-muted` | `#55554F` | `#A3A39B` |
| `--accent` (red) | `text-accent` / `bg-accent` | `#C42A14` | `#FF6A4E` |
| `--accent-hover` | `*-accent-hover` | `#A32310` | `#FF8A72` |
| `--accent-2` (cobalt) | `text-accent-2` / `border-accent-2` | `#1B4FD8` | `#7F9CFF` |
| `--accent-2-hover` | `*-accent-2-hover` | `#1640B0` | `#9DB3FF` |
| `--on-accent` | `text-on-accent` | `#FFFFFF` | `#0A0A0A` |

No success or warning tokens: status is a dot plus a word, drawn in cobalt (filled = running, outlined = in progress), so no extra hue was needed.

Theme selection order: `data-theme` on `<html>` wins; with no attribute, `prefers-color-scheme` decides. The same dark values are declared under `:root[data-theme="dark"]` and under the media query for `:root:not([data-theme="light"])`. `.theme-light` / `.theme-dark` carry the same sets so the style guide can pin a subtree.

Other scales, all in `@theme`:

- **Type**, fluid with `clamp()` from a 390px phone to a 1280px desktop: `text-xs` 12px, `text-sm` 14px, `text-base` 16 to 17px, `text-lg` 18 to 20px, `text-xl` 20 to 24px, `text-2xl` 24 to 32px, `text-3xl` 30 to 44px (section h2), `text-4xl` 40 to 72px (hero h1). Each carries its own line-height (1.55 body, 1.0 at the top).
- **Spacing**: Tailwind's 4px base (`--spacing: 0.25rem`) is the scale. Two named rhythms: `gutter` (16 to 40px, `px-gutter`) and `section` (64 to 112px, `py-section`).
- **Widths**: `max-w-page` 1200px, `max-w-measure` 65ch.
- **Radii**: `rounded-sm` 2px (focus ring only), `rounded-full` for status dots. Everything else is square.
- **Shadow**: `shadow-lift` for hovered cards. No other shadows.
- **Easing**: `ease-out-quart`.

Base layer sets body font/size/line-height, heading family and weight (`h1`/`h2` at 125% width, `h3` at 112.5%), the cobalt focus ring, and `scroll-margin-top` for anchors.

## Theme toggle

- `src/lib/theme.ts`: reads and writes `data-theme`, persists to `localStorage("theme")` inside try/catch, notifies subscribers, and listens for system changes and cross-tab `storage` events.
- `src/components/ThemeToggle.tsx`: a 36px square `<button type="button">` with Phosphor sun/moon icons. `useSyncExternalStore` with a `null` server snapshot, so the server renders a generic "Switch color theme" label and the client replaces it with "Switch to dark theme" / "Switch to light theme" without a hydration mismatch. Which icon shows is decided in CSS (`.theme-icon-*` in `globals.css`), so it is right before hydration.
- `src/app/layout.tsx`: a one-line inline `<script>` in `<head>` reads the stored value and sets `data-theme` before first paint. Verified on the static export: after a keyboard toggle and reload, `data-theme="dark"` is already present at `DOMContentLoaded` and the body background is dark with no flash.

## Typography

Archivo only, via `next/font/google` (self-hosted, `latin` subset, `display: swap`, variable weight, `wdth` axis loaded). Space Grotesk, IBM Plex Sans and IBM Plex Mono are no longer loaded by the layout. Data-shaped text (dates, IPs, GPAs) uses `tabular-nums` instead of a mono face. Body measure is `max-w-measure` (65ch).

## Primitives (`src/components`)

| Component | File | Notes |
|-----------|------|-------|
| `Container` | `ui.tsx` | `max-w-page px-gutter` |
| `Section` | `ui.tsx` | 2px top rule, `py-section`, `id` + `aria-labelledby`, `title` and optional `intro` slots |
| `TagList` | `ui.tsx` | Outlined 1px chips, `translate="no"` |
| `TextLink` | `ui.tsx` | Cobalt underline; external adds `rel="noopener noreferrer"` |
| `Button` | `Button.tsx` | `primary` (red fill), `secondary` (2px ink outline, inverts on hover), `ghost` (cobalt underline); sizes `md` 44px, `sm` 36px; renders `<a>` with `href` else `<button>`; cobalt `focus-visible` ring |
| `Card` | `Card.tsx` | Surface, 3px top rule, lift on hover (`-translate-y-0.5` + `shadow-lift`), `as` div/article/li, `lift` off switch |
| `Stat` | `Stat.tsx` | Big red expanded figure + muted label, `md` and `lg` |
| `Reveal` | `Reveal.tsx` | Client wrapper; sets `data-reveal` only from an effect, so no JS, reduced motion, or already-on-screen all render children visible. 600ms fade and 14px lift via CSS |
| `ThemeToggle` | `ThemeToggle.tsx` | See above |

`Reveal` replaces the previous CSS scroll-driven `.reveal` on the four case-study diagram panels. The hero diagram still draws with pure CSS.

## Applied site-wide

Every component picked up the tokens and type scale. Visible changes, all restyling: cobalt replaces amber for links, flow lines and status; red is reserved for impact figures and the two resume buttons; all corners are square; section dividers are 2px ink rules; cards and diagram panels get a 3px top rule; tags are outlined; the hero diagram boxes are ink-outlined with cobalt flow; the nav has the theme toggle next to the Resume button. Sub-lines and body copy are full-strength ink; muted is for meta and captions only. The "View Repo" aria-label now begins with its visible text, which clears the Phase 0 Lighthouse note.

## Contrast (WCAG AA)

Computed for every pairing used. Requirement: 4.5:1 for text, 3:1 for large text and UI graphics.

| Pair | Light | Dark |
|------|-------|------|
| Text on bg / surface / raised | 18.3 / 16.6 / 19.4 | 16.1 / 14.5 / 13.5 |
| Muted on bg / surface / raised | 6.9 / 6.3 / 7.4 | 7.1 / 6.4 / 6.0 |
| Cobalt (links) on bg / surface / raised | 6.1 / 5.6 / 6.5 | 7.0 / 6.3 / 5.8 |
| Cobalt hover on bg | 8.1 | 8.9 |
| Red (figures, 30px+) on bg / surface / raised | 5.3 / 4.8 / 5.6 | 6.4 / 5.8 / 5.4 |
| Red hover on bg | 6.9 | 7.9 |
| Button label on red / red hover | 5.7 / 7.5 | 7.0 / 8.6 |
| Secondary button hover label (bg on ink) | 18.3 | 16.1 |
| Ink rules on bg (non-text) | 18.3 | 16.1 |
| Soft border on bg (decorative only) | 1.45 | 1.58 |

Everything that carries text clears 4.5:1 in both themes, including red, which only needs 3:1 at the sizes it is used. The soft border is used for swatch outlines and the footer rule only, never as the sole indicator of anything.

## Verification

- `tsc --noEmit` and `eslint` clean; `next build` exports `/`, `/design-preview`, `/_not-found`.
- No console warnings or errors on `/` or `/design-preview`; no horizontal overflow at 1440 or 390.
- Playwright functional and axe suites (29 tests across desktop light, desktop dark, mobile dark) pass against the export. The three visual-baseline tests were skipped on purpose: the screenshots in `e2e/home.spec.ts-snapshots/` still show the old skin and need `npm run test:e2e:update` once this look is approved.
- Theme toggle exercised by keyboard on the export: attribute, storage, label and background all switch, and the choice survives reload without a flash.

## Style guide

`http://localhost:3000/design-preview` now opens with the living style guide: type scale, colour tokens with hex, all button variants and sizes, text link, tags, both stat sizes, a card, a section header, the Reveal block, and the toggle, pinned light on the left and dark on the right. The Phase 1 three-direction comparison follows below it.

## Follow-ups not done here

- `DESIGN.md` still documents the v1 tokens (dark-first amber). A one-line note at its top now points here; rewriting it is a separate task.
- Visual baselines need regenerating (see above).
- The Lighthouse re-run belongs at the end of Phase 3, after sections are restructured.

---

# Phase 3: hero and navigation

Built on the Phase 2 tokens and primitives. Content is unchanged except for one addition: three hero proof chips in `src/content/portfolio.ts` (`profile.proof`), each restating a fact already on the site.

## Navigation (`src/components/SiteNav.tsx`, client)

- Sticky bar. Transparent-bordered and 80% opaque at the top of the page; after 20px of scroll (or while the mobile menu is open) it gains the 2px ink rule and goes to 95% opaque. `useScrolled` in `src/hooks/use-scrolled.ts` reads `scrollY` through `useSyncExternalStore`, so there is no setState-in-effect and the server render is the unscrolled state.
- Contents: name (links to `#top`), About, Work, Experience, Skills, Contact, theme toggle, and a secondary Resume button that opens `/resume.pdf` in a new tab (`target="_blank" rel="noopener noreferrer"`). The old nav had no About link; Credentials and Other projects still have no link, as before.
- Active section. `useActiveSection` in `src/hooks/use-active-section.ts` observes the five sections with a band 30% to 40% down the viewport; the first section in document order that crosses the band is active, and at the very bottom of the page the last one is. The active link gets `aria-current="location"` and a cobalt underline. The same attribute is set on the mobile panel's links.
- Mobile (under `md`). The bar shows name, theme toggle and a menu button (`aria-expanded`, `aria-controls="mobile-menu"`, label flips between "Open menu" and "Close menu"). The panel is full width, sits under the bar and fills the rest of the viewport. `useMobileMenu` in `src/hooks/use-mobile-menu.ts` locks `html { overflow: hidden }` while open, traps Tab and Shift+Tab inside the header's visible focusables, closes on Escape and returns focus to the button, closes on link click, and closes itself if the viewport grows past 768px.
- The "Skip to content" link in `page.tsx` remains the first focusable element.

## Hero (`src/components/Hero.tsx`)

Headline (unchanged), the existing sub-line, two buttons ("See my work" to `#work`, "Get in touch" to `#contact`, both smooth-scroll through the global `scroll-behavior`), and three proof chips (`TagList` with the new `size="md"`):

- Surplus AI, in active use at ASU Surplus (from the Surplus AI status and context lines)
- Two years of data engineering at Celebal (from About)
- Databricks Certified Data Engineer Professional (from Certifications)

The DevHacks example in the brief is not on the site and was not used. The hero's previous "Download Resume" button and GitHub, LinkedIn and Email links are gone from the hero: Resume lives in the nav, LinkedIn and Email were already in Contact, and GitHub was added to Contact next to LinkedIn so no link left the site.

**Entrance.** Five blocks (`h1`, sub-line, buttons, chips, diagram) carry an `.enter` class and a `--i` index; `globals.css` turns that into a 400ms fade-and-lift starting 70ms apart, so the last block finishes at 680ms. Not defined under `prefers-reduced-motion: reduce`.

**Fit.** On a 390px phone the diagram drops below the text at a 300px max width. Measured on a 390 by 750 viewport: the chips end at 571px, so headline, sub-line, buttons and chips are all above the fold.

## Medallion diagram (`src/components/MedallionDiagram.tsx`)

Rebuilt as a server-rendered inline SVG (replaces `HeroDiagram.tsx`, which is removed; the six boxes and their labels are the same). Colours come from tokens: ink outlines, surface fills, cobalt connectors, cobalt outline on the LLM box.

- **Dots.** Two `<circle>`s drawn before the boxes, so they pass beneath each one. Each follows a CSS `offset-path` through the box centres (`M220 402 H76 V296 H364 V190 H220 V72`, 906 units) on a 5s linear loop, the second delayed by 2.5s. The path overlaps every drawn connector.
- **Stage lighting.** Each stage's `<rect>` has a 2.5s keyframe animation keyed to the measured arrival point of a dot (bronze at 49%, silver 74.6%, gold 6.4%, serving 37.4%, LLM 92%; source pulses at 0%). On arrival the fill snaps to a 16% cobalt tint of the surface, holds for 8% of the period, and fades back over 14%.
- **Fallbacks.** The animation is wrapped in `@supports (offset-path: path(...))` and `prefers-reduced-motion: no-preference`. Outside either, the dots are `display: none` and every stage renders in the lit tint, still. Verified in headless Chrome with reduced motion forced.
- No library; no JavaScript in the diagram.

## Headline and sub-line: options

The brief allowed a tighter headline. The current one is already short and specific, so it stays as the default. Two alternatives, in case you want to compare:

| | Headline | Sub-line |
|---|---|---|
| Current (default) | I build the data layer, and the AI on top of it. | Data engineer working across Databricks, Azure, and AWS. Lately building LLM systems that run on real data. |
| Option B | The data layer, and the AI on top of it. | Data engineer for teams on Databricks, Azure and AWS, building LLM systems that run on their real data. |
| Option C | Data platforms first. AI that runs on them. | Data engineer for healthcare, energy, manufacturing and university teams, on Databricks, Azure and AWS. |

Option C's "for whom" list comes from the About and Experience copy. Changing either string is a one-line edit in `src/content/portfolio.ts`.

## Verification

- `tsc`, `eslint` and `next build` clean. No console warnings; no horizontal overflow at 1440 or 390.
- Playwright (functional and axe, visual baselines still skipped): new tests cover the nav links and new-tab Resume, `aria-current` after scrolling to Experience, the scrolled border, the mobile menu (open, focus trap over 12 Tabs, Escape with focus return, scroll unlock, close on link click), the hero contents and chips, and the phone-fold check.
- Animation verified in headless Chrome: both dots run `medallion-travel` on the offset path and the gold stage runs `stage-gold`; with reduced motion the dots are hidden, the stages are lit, and the hero entrance animation is `none`.

---

# Phase 4: project system and diagrams (2026-10-30)

## Data (`src/data/projects.ts`)

One typed list, `projects`, with the runbook schema (`slug, title, oneLiner, status, impact[], highlights[], stack[], links, featured, diagram?`) plus optional fields so nothing from the old `portfolio.ts` is lost: `date`, `context`, `credit`, `tags`, `problem`, `built`, `details` (the six "How it works" parts), `secondaryDiagrams`, `statusNotes`, `statusDetail`. `featuredProjects` and `otherProjects` are derived; `primaryLink` picks live, then repo, then write-up. Old vs new text: `docs/screenshots/phase-4/content-diff.md`. The `tags` facet is a judgment call recorded in STATUS: `ai` where an LLM or ML model does the work, `data` where a pipeline or dataset is the job.

## Design plan

- Hierarchy on a featured card, in order of weight: the impact figures (red, `text-4xl`, the only red on the card), the diagram, the title, the prose. Status is a word in cobalt with a dot only when something is running for real. Meta (date, context) sits as separate muted spans, never joined with middle dots.
- Grid cards are the same card primitive, three up on desktop, with one figure, one line, one or two muted sentences, stack chips, and a cobalt arrow that only appears when there is somewhere to go. The title is the single anchor; its `::after` covers the card so the whole surface clicks with one tab stop.
- Filters are buttons styled like the secondary button; pressed = ink fill. A live count ("3 of 8 projects") announces changes. No URL state.
- Hover and keyboard focus are the same state: 2px lift (only under `motion-safe`), top rule to cobalt, one shadow, arrow slides 2px.

## Diagram engine (`src/components/diagrams/FlowDiagram.tsx`)

A diagram is `nodes` (boxes with label, kicker, sub lines, variant), `edges` (orthogonal connectors with arrowheads, computed from box geometry), and `tracks` (ordered box ids a dot travels through). The engine computes each track's path through the box anchors, its length, and the fraction of the loop at which the dot reaches each box; each box gets a lit overlay rect whose opacity animation is phased to that arrival (`--arrive`, `--period`), so stages light in order and the data drives the timing. Elbow corners are chosen to sit inside one of the two boxes, so a dot rides along the switch bar rather than cutting across space.

Each diagram has a wide and a narrow layout; both SVGs are in the DOM and CSS shows one per breakpoint (the hidden one is `display: none`, so it costs nothing and is skipped by screen readers). Every SVG has `<title>` and `<desc>`, every figure a visible caption.

Motion gates, in order: `prefers-reduced-motion: no-preference`, `@supports (offset-path)`, and `data-animate="on"` set by `useInView` (IntersectionObserver plus `visibilitychange`). The default with none of those is every box lit and still. Dots use `offset-distance` like the hero medallion (the documented exception to transform/opacity); the lighting overlays animate opacity only, which is the fix the Phase 3 code review suggested for the hero.

Diagrams: Surplus pipeline (two spec sources into one inventory and an LLM), Surplus cluster network (switch, five nodes with their IPs, dots from the head node), Surplus privacy layers (nested rings; the dot leaves the app and never reaches the Internet box), Watchtower agent flow (three agents in sequence, the dot detours through the RAG tool).

---

# Phase 7: lenses (2026-10-30)

## Structure

- The Work section (`#work`, h2 "Work") holds the lens switcher. `Work.tsx` is a server component: it renders the Highlights lens (`WorkExplorer`, the Phase 4 view, unchanged) as static HTML and passes it as children to the client `Explore` shell (`src/components/explore/`).
- The other five lenses render from `public/graph.json`, fetched once on first use through `withBasePath` (`src/hooks/use-graph.ts`, with a shape check). Their view models are pure functions in `src/data/graph/lenses.ts`, built on `src/data/graph/selectors.ts`, which import types and structure only, so the client bundle never carries the graph data.
- The lens lives in the hash: `#lens=timeline`, `skills`, `problems`, `industries`, `recruiter`; Highlights clears it. The shell follows `hashchange`, so the Experience and Skills summaries link straight into Timeline and Skill map, and any `#project-<slug>` link (Recruiter mode, Timeline, the lens lists, later the Ask panel) switches back to Highlights and scrolls to the card.
- Highlights stays mounted and hidden while another lens shows, so its filter state survives and its diagrams stop animating (`display: none`, so the in-view observer reports false).

## Design

- Switcher: one ink-bordered segmented bar, pressed segment ink-filled, 3 by 2 on phones so every lens stays visible, one row from `md`. Arrow keys, Home and End move and select. Filter chips stay separate and lighter.
- Timeline: a 2px cobalt axis (the only flow-line colour), date column right-aligned against it from `md`, filled dot for the current role, outlined for the rest, dashed for undated work. Roles and degrees are on the axis; projects nest under the role or degree their `during` edge names. The full Experience bullets now live here.
- Skill map: Skills-section groups plus "Also in project stacks" for tools only projects use. Counted skills are buttons with a cobalt count; unused skills are muted tags, not buttons. The list beneath defaults to all projects.
- By problem and By industry: one card shape, summary first (it carries the figure), linked projects and roles beneath with their lead figure in ink. Red stays reserved for Stats.
- Recruiter mode: name, headline, subline, current role, status line, the three metrics tagged `headline` in red, featured projects as single lines, the eight most-used skills, contact. A "Print or save as PDF" button opens the print dialog; print CSS keyed on `html[data-lens="recruiter"]` hides everything else and forces light colours. One page on Letter and A4 (checked in e2e with `page.pdf`).
- Motion: the incoming panel fades in over 200 ms under `prefers-reduced-motion: no-preference` only.
- Experience and Skills sections shrink to summaries (every role on one line plus the Celebal summary; each skill group with its first six skills and a count of the rest), each with a link into its lens. Contact: status line, large mailto, three icon links (LinkedIn, GitHub, Resume) with visible labels and aria-labels; footer with name, build year, location, "Built with Next.js, deployed on GitHub Pages.", and Back to top.

---

# Phase 9: motion, accessibility, performance, mobile (2026-10-30)

## Lighthouse (mobile preset, `npm run lighthouse`, three runs on `npx serve out`, median)

| | Performance | Accessibility | Best Practices | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| Phase 0 baseline (v1 site) | 97 | 100 | 100 | 100 | | | |
| Phase 9 start (after Phase 8) | 96 | 100 | 100 | 100 | 2.71 s | 19 ms | 0 |
| Phase 9 end | 96 | 100 | 100 | 100 | 2.6 to 2.7 s | 32 ms | 0 |

Targets (Performance 90, Accessibility 90, Best Practices 95, SEO 95) met throughout. Remaining Lighthouse notes are environmental or structural: `uses-long-cache-ttl` (local `serve`; GitHub Pages sets its own headers), render-blocking CSS (one Next stylesheet), DOM size (the full Timeline, Skills and Experience text is server-rendered on purpose, Phase 7 ruling). LCP sits just above 2.5 s under Lighthouse's simulated slow 4G; the hero headline no longer fades in, so it paints with the first frame.

Bundle: client JS 214 KB gzipped before and after (no new runtime code in Phase 9). Lazy chunks: lens views (about 10 KB gz) with `graph.json`, MiniSearch (about 7 KB gz) with `search-index.json`, both on first use; the search index is requested on first focus of the hero prompt box or on the first question. Fonts come from `next/font`, which preloads the Archivo files.

## Accessibility

- axe-core (WCAG 2.0/2.1/2.2 A and AA tags) through `@axe-core/playwright`: 0 violations on the page at 390/768/1280 in light and dark (verify) and per lens and inside the open Ask dialog (e2e). The `@axe-core/cli` dev dependency and `npm run axe` are installed as the runbook asks, but the CLI needs a ChromeDriver; downloading one with `browser-driver-manager` was not permitted in this session, so it was not run (see STATUS).
- Targets: every control outside running text is at least 44 px tall at 360, 390, 414, 768 and 1024 (asserted in e2e). Header buttons, nav links, filter chips, disclosures, the contact email and card links were raised.
- Metadata: `lang="en"`, title, description, canonical, Open Graph and Twitter large-image card with `public/og.png` (1200 by 630, rendered by `scripts/og-image.mts` from the site's own Archivo build), `robots.txt` and a one-URL `sitemap.xml`. On a GitHub Pages project site these are served under `/srujan-portfolio/`, where crawlers do not look for `robots.txt`, so the file is inert live (it helps local Lighthouse only); the real guard for `/design-preview` is its own `robots: noindex` meta until Phase 10 removes the route. The sitemap can be submitted in Search Console if wanted.

## Motion

- The hero medallion now animates opacity overlays (`.medallion-lit`) instead of `fill`, and only while on screen and the tab is visible (`AnimateInView`, the same `useInView` the project diagrams use). Reduced motion, no JavaScript, and offscreen all show every stage lit and still. Dots keep `offset-distance` (the documented exception since Phase 3).
- Card hover shadow is a `before:` layer that fades its opacity; the card itself only translates.
- One easing family: `--default-transition-timing-function` is the house `--ease-out-quart`, so transitions without their own `ease-` utility (including the card's shadow layer) share the curve.

# Phase 11: release (2026-10-30)

- Merged `redesign/v2` into `main` as 9dc7e7c (`--no-ff`) and pushed it with the rollback tag `v1-before-redesign` (78d7a7b). The Pages workflow run 41111138727 built and deployed it (build 1m1s, deploy 11s). Live: https://srujanrudrapati.github.io/srujan-portfolio/
- Changes in the merge besides the redesign: DECISIONS 5 (CI on Node 22, `npm run lint && npm run test:unit`, then `npm run build`), 7 (hero chip with the Celebal figure) and 8 (About drops the repeated availability sentence).
- Live checks with `curl`: 20 of 20 URLs return 200. They cover the home page, `resume.pdf` (`application/pdf`, 133,110 bytes, starts `%PDF-1.5`), `graph.json` (157 nodes, 142 edges, byte-identical to the local build), `search-index.json`, `og.png`, `sitemap.xml`, `robots.txt`, `.nojekyll`, `404.html` and every root-relative `href`/`src` in the live HTML, which includes all `_next` assets. The new chip is live and the old chip and About sentence are gone.

## Lighthouse on the live URL (mobile preset, `npm run lighthouse -- <live url> 3`)

| | Performance | Accessibility | Best Practices | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| Phase 0 baseline (v1 site, local export) | 97 | 100 | 100 | 100 | | | |
| Phase 9 end (local export) | 96 | 100 | 100 | 100 | 2.6 to 2.7 s | 32 ms | 0 |
| **Phase 11, live** (runs 100, 100, 99) | **100** | **100** | **100** | **100** | 1.58 s | 11 ms | 0 |

There was an earlier three-run batch just before this one. Its output got cut off and only part of it was kept: SEO 100 on every run, median LCP 2.36 s, TBT 46 ms, CLS 0. The live score beats the local export because GitHub Pages serves compressed files with cache headers, and local `serve` does not. Simulated-throttling LCP moves by about 0.8 s between batches.

- Not confirmed: the job-steps API and the job log for run 41111138727 list only Setup Pages and the cache steps, so this session could not see the new lint and test step's output. The run did succeed on the merge commit, and the deployed `graph.json` matches a local `npm run build`.


## v4 live (Phase W9, 2026-11-01)

Merged `redesign/v4` (with v3) into `main` as `377c614` (`--no-ff`) and pushed `main` plus the tags `v2-before-v3` and `v2-before-v4` (rollback point: `v2-before-v4` = `ecfa9fc`). The existing Pages workflow (run 41367322294) built and deployed it; both jobs succeeded.

Live check at https://srujanrudrapati.github.io/srujan-portfolio/:
- All 18 sitemap routes plus `resume.pdf`, `graph.json`, `search-index.json`, `favicon.ico`, `.nojekyll` and `sitemap.xml` answer 200; `/no-such-page` answers 404.
- All 28 `_next` scripts, styles and fonts referenced from the 18 pages answer 200, all under the `/srujan-portfolio` prefix.
- `/work` serves the new catalogue (pause control present); the Cooked sublabel reads "Track 1, DevHacks × Cubbie"; no "vote" on `/work`, `/work/devhacks-cubbie`, `/experience`, `/cv`, `graph.json` or `search-index.json`.

Live Lighthouse, median of 3 (performance / accessibility / best practices / SEO; LCP, TBT, CLS):

| Route | Mobile | Desktop |
|---|---|---|
| `/` | 98 / 100 / 100 / 100; 2.48 s, 31 ms, 0 | 100 / 100 / 100 / 100; 0.52 s, 0 ms, 0 |
| `/work` | 97 / 100 / 100 / 100; 2.63 s, 17 ms, 0 | 100 / 100 / 100 / 100; 0.53 s, 0 ms, 0 |
| `/work/surplus-ai` | 97 / 100 / 100 / 100; 2.57 s, 26 ms, 0 | 100 / 100 / 100 / 100; 0.53 s, 0 ms, 0 |
| `/experience` | 98 / 100 / 100 / 100; 2.48 s, 30 ms, 0 | 100 / 100 / 100 / 100; 0.51 s, 0 ms, 0 |
| `/about` | 98 / 100 / 100 / 100; 2.49 s, 12 ms, 0 | 100 / 100 / 100 / 100; 0.52 s, 0 ms, 0 |
| `/contact` | 98 / 100 / 100 / 100; 2.49 s, 21 ms, 0 | 100 / 100 / 100 / 100; 0.52 s, 0 ms, 0 |

All above the v4 budget (mobile 90+, desktop 98+, accessibility 100, CLS under 0.02). Not checked from here: a real Mac trackpad on the catalogue, and the LinkedIn link (it blocks automated checks).

### DECISIONS 24 a and b live (2026-11-01)

Merged as `e75311e`; Pages deploy succeeded. Live home shows the Celebal lede and the contact row (mailto, LinkedIn, `/srujan-portfolio/resume.pdf` answering 200). All 18 sitemap routes and every home `_next` asset answer 200. Live Lighthouse `/`, median of 3: mobile 98 / 100 / 100 / 100 (LCP 2.48 s, CLS 0), desktop 100 / 100 / 100 / 100 (LCP 0.53 s, CLS 0).
