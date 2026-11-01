# v4 information architecture (Phase W7)

v4 ("Midnight & Bronze") is a hub: the home page links to four pages, and every other page opens with a back pill. Nothing was deleted. This file records where each piece of content that the v3 visuals and the v3 home carried now lives, checked before any v3 component was removed (runbook W7.4, rule 4).

## Routes

| Route | Purpose | Built from |
|---|---|---|
| `/` | The hub: headline, lede, now line, Ask link, four tiles (Work, Experience, About, Contact), the dot field | `home/Home.tsx`, `src/data/home.ts` |
| `/work` | Catalogue of the four featured projects (looping) and a list of all eleven | `catalogue/WorkView.tsx`, `src/data/work.ts` |
| `/work/[slug]` | One page per project (11, from the graph): band or compact header, results, what it does, the problem, the diagrams, stack, next project | `project/ProjectView.tsx`, `src/data/project-page.ts` |
| `/experience` | Timeline: one lane per role plus Milestones, a detail panel with every outcome | `experience/Timeline.tsx`, `src/data/experience.ts` |
| `/about` | Statement, two paragraphs, the medallion diagram, education, certifications, every skill group | `about/AboutView.tsx`, `src/data/about.ts` |
| `/contact` | Email, the note composer (mailto), GitHub, LinkedIn, resume, Ask | `contact/ContactView.tsx` |
| `/explore` | The v2/v3 lenses: Highlights (the work index with its filters), Timeline, Skill map, By problem, By industry, Recruiter | `explore/Explore.tsx`, `work/WorkIndex.tsx` (DECISIONS 23) |
| `/cv` | The recruiter one-pager with the resume; prints black on white on one page | `explore/RecruiterLens.tsx` |
| 404 | "Row not found", links to every page, the "Clean the pipeline" game | `src/app/not-found.tsx`, `game/` |

Global, on every page: the skip link, the header (name, availability), the footer (name and year, Arizona time), the progress line, the cursor, page transitions, the command palette (every page, every project, copy email, resume, the game, Ask) and the Ask panel.

## v3 visuals removed in W7 → where their content is now

| v3 visual | What it carried | v4 location | Check |
|---|---|---|---|
| Home particle stream (`HeroStream` 3D scene) | Medallion tiers (bronze raw, silver cleaned, gold modeled) condensing into "LLM"; its aria-label described the same | The medallion diagram on `/about` (static, with a caption naming the same tiers and the LLM layer); the Celebal "Medallion architecture on Databricks" outcome on `/experience` | [x] |
| Surplus AI 3D cover (`surplus-line`) | Decorative: boxes on a conveyor through four compute units | `/work/surplus-ai`: three architecture diagrams, results ("~80%", "~10 min", "14B"), the cluster facts | [x] |
| Label Lens 3D scene | Decorative: a scanned bottle and a warning column | `/work/label-lens`: the real screenshot, "44/44" quoted warnings, "4 to 9 s" | [x] |
| Receipts 3D cover (DevHacks) | "{receipts-tests} paper tiles, one per automated test": 493 tests | `/work/devhacks-cubbie`: the "493 automated tests in CI for Receipts" result tile and the Receipts entry | [x] |
| Watchtower 3D scene | Decorative: a beacon over a node terrain | `/work/supply-chain-watchtower`: the agent-flow diagram and "3 agents" | [x] |
| Poster images (`public/posters/`) and the `/studio/posters` render route | Static frames of the scenes above (decorative; alt text empty or the cover labels) | As the scenes above; next-project links now carry the project name only | [x] |
| GSAP scroll scrub on the case-study diagrams | Motion only | The same diagrams draw once on entry with CSS (`use-draw-on-enter`) | [x] |
| GSAP Flip between `/explore` lenses | Motion only | Lens switches fade in (CSS, 200 ms) | [x] |
| The rail (`site/Rail.tsx`) on inner pages | Stage labels ("stage 02 / transform"), the scroll rail | Labels were v3 decoration with no facts; pages now open with a back pill and a Bodoni title | [x] |
| v3 `CountUp`, `SplitReveal`, `HorizontalReel`, `Pin`, `Magnetic` (GSAP) | Motion only; values were in the HTML | Figures are static text; magnetic is `[data-magnetic]` in the shell; the hero lines rise in CSS | [x] |

## v3 home sections → v4

| v3 home item | v4 location | Check |
|---|---|---|
| Name, headline, sub-line ("Data engineer working across Databricks, Azure, and AWS…") | Header and home headline; the sub-line opens the `/cv` sheet | [x] |
| Now line (current role since June 2026, M.S. graduating December 2026, available early 2027) | Home now line ("Now running Surplus AI in production at ASU Surplus"), header availability, `/about` and `/contact` status line, `/experience` (current role) | [x] |
| Lead figure (about 10 million records a day) | Home lede, `/experience` (Celebal figures), `/cv` | [x] |
| Calls to action: See my work, Resume, email | Home tiles (Work, Contact), `/contact` (email, resume), palette | [x] |
| Proof chips (Surplus AI in production; Associate at Celebal 2022 to 2024; Databricks Certified Data Engineer Professional) | Home now line; `/experience` associate bar; `/about` certifications and `/cv` | [x] |
| "What I build" statements, each with "See the proof" | The same facts on `/experience` (pipelines and the 10 million records), `/work/surplus-ai` (offline AI on Mac minis), `/work/label-lens` (warnings quote the label); `/about` statement | [x] |
| Selected work reel (four featured, figure, one-liner) | `/work` catalogue (four featured with key figure and description) | [x] |
| Proof section (figures with their sources) | Result tiles on each project page; role figures on `/experience` | [x] |
| Ask box and contact block | Home "Ask about my work"; `/contact` (email, composer, profiles, resume, Ask) | [x] |
| v3 footer (email, GitHub, LinkedIn, resume) | `/contact`, `/cv`, palette (copy email, resume) | [x] |
| v3 nav (Work, Explore, About, CV, Resume) | Home tiles, back pills, palette (Pages: Work, Experience, About, Contact, Explore, CV) | [x] |

## Links and evidence

- Graph evidence URLs: roles and their figures point at `/experience`; education at `/about#credentials`; skills at `/about#skills` (both anchors exist on the v4 About page and are tested). `scripts/build-graph.mts` knows every v4 route.
- Project links (`/work/<slug>`), lens links (`/explore#lens=<id>`) and files (`/resume.pdf`) are unchanged and go through `withBasePath` where they are raw strings.
