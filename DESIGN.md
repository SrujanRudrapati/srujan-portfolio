# DESIGN.md: Srujan Portfolio

A plain-text design system for AI agents and humans. It follows the
[Stitch DESIGN.md format](https://stitch.withgoogle.com/docs/design-md/specification/)
as extended by [awesome-design-md](https://github.com/VoltAgent/awesome-design-md),
and is checked against the TasteSkill (`design-taste-frontend`) and
Vercel Web Interface Guidelines.

Use it by telling your agent: *“Build this page following DESIGN.md.”*

**Source of truth:** tokens live in `src/app/globals.css`, fonts in `src/app/layout.tsx`, shared primitives in `src/components/ui.tsx`, and every word of copy in `src/content/portfolio.ts` (taken from `PORTFOLIO_BRIEF.md`). If this file and the code disagree, fix one so they match.

---

## 0. Design Read & Dials

**Design Read:** Reading this as a data engineer portfolio for recruiters and hiring managers, often opened on a phone, with a technical and confident language, leaning toward Tailwind v4 + CSS variables, Space Grotesk / IBM Plex and diagrams over decoration.

| Dial | Value | Why |
|------|-------|-----|
| `DESIGN_VARIANCE` | 6 | Asymmetric splits and staggered grid widths, never chaotic |
| `MOTION_INTENSITY` | 3 | Hover, focus and press feedback, plus one pipeline diagram that draws once on load |
| `VISUAL_DENSITY` | 4 | Airy sections, but the content is real work and it should read quickly |

---

## 1. Visual Theme & Atmosphere

**Mood:** Technical, confident, fast. A data platform at night: deep blue-slate ground, cool readable text, one warm amber signal.

**Density:** Medium-low. Generous section spacing, short paragraphs, content held to a 65ch reading width.

**Philosophy**
- **Diagrams over decoration.** Visuals explain how a system works. No blobs, glows, gradients or stock art.
- **One signal color.** Amber marks actions and key moments. It is never used for decoration or headings.
- **Type does the hierarchy.** Space Grotesk for headings, IBM Plex for reading, IBM Plex Mono for data-shaped text (dates, stack tags).
- **Honest content.** Every metric and title comes from the brief. Design never invents numbers, logos or social proof.
- **Fast by default.** Static HTML, server-rendered components, no client JavaScript unless something moves.

---

## 2. Color Palette & Roles

Dark is the default theme. Light follows `prefers-color-scheme: light`, and `data-theme="light"` / `data-theme="dark"` on `<html>` forces either one.

| CSS variable | Tailwind name | Dark | Light | Role |
|--------------|---------------|------|-------|------|
| `--bg` | `bg-bg` | `#0E1A2B` | `#F3F6FA` | Page background |
| `--raised` | `bg-raised` | `#15253B` | `#E6ECF4` | Project cards, raised panels |
| `--border` | `border-line` | `#2A3F5C` | `#C3CEDC` | Section dividers, hairlines, outline buttons |
| `--text` | `text-ink` | `#E7EDF5` | `#0E1A2B` | Headings and primary text |
| `--muted` | `text-muted` | `#9DB0C8` | `#46566E` | Body paragraphs, dates, captions, nav links |
| `--accent` | `text-accent` / `bg-accent` | `#F0B44C` | `#8A5600` | Primary CTA, links, focus ring, bullet ticks, icons |
| `--accent-hover` | `*-accent-hover` | `#F5C773` | `#6E4400` | Hover state for accent elements |
| `--on-accent` | `text-on-accent` | `#0E1A2B` | `#F3F6FA` | Label on an accent-filled button |
| `--tag-bg` | `bg-tag` | `#1D3150` | `#DCE4EE` | Stack and skill tag fill |
| `--tag-fg` | `text-tag-ink` | `#C9D6E6` | `#26364D` | Stack and skill tag text |

The light accent is a darker amber, not the same hex, so links and buttons stay readable on a pale background.

### Verified contrast (WCAG 2.1)

| Pair | Dark | Light | Level |
|------|------|-------|-------|
| Text on bg | 14.8 : 1 | 16.1 : 1 | AAA |
| Text on raised | 13.1 : 1 | 14.7 : 1 | AAA |
| Muted on bg | 7.9 : 1 | 6.9 : 1 | AA (AAA in dark) |
| Muted on raised | 7.0 : 1 | 6.3 : 1 | AA |
| Muted on tag | 5.9 : 1 | 5.8 : 1 | AA |
| Accent on bg | 9.4 : 1 | 5.7 : 1 | AA+ |
| Accent on raised | 8.3 : 1 | 5.2 : 1 | AA |
| Accent hover on bg | 11.1 : 1 | 7.8 : 1 | AAA |
| Tag text on tag | 8.9 : 1 | 9.5 : 1 | AAA |
| Button label on accent | 9.4 : 1 | 5.7 : 1 | AA+ |
| Button label on accent hover | 11.1 : 1 | 7.8 : 1 | AAA |

`--border` against `--bg` is about 1.5 : 1 by design: borders are decorative dividers, never the only way to see a control. No pure `#000000` or `#FFFFFF` anywhere.

### Tokens

```css
:root {
  color-scheme: dark;
  --bg: #0e1a2b;
  --raised: #15253b;
  --border: #2a3f5c;
  --text: #e7edf5;
  --muted: #9db0c8;
  --accent: #f0b44c;
  --accent-hover: #f5c773;
  --on-accent: #0e1a2b;
  --tag-bg: #1d3150;
  --tag-fg: #c9d6e6;
}

@media (prefers-color-scheme: light) {
  :root:not([data-theme="dark"]) {
    color-scheme: light;
    --bg: #f3f6fa;
    --raised: #e6ecf4;
    --border: #c3cedc;
    --text: #0e1a2b;
    --muted: #46566e;
    --accent: #8a5600;
    --accent-hover: #6e4400;
    --on-accent: #f3f6fa;
    --tag-bg: #dce4ee;
    --tag-fg: #26364d;
  }
}
:root[data-theme="light"] { /* same values as the light block */ }
```

These are mapped to Tailwind utilities in `@theme inline` (`bg-bg`, `text-ink`, `text-muted`, `border-line`, `bg-accent`, `bg-tag` and so on). Use those utilities; never hard-code a hex in a component.

`theme-color` meta: `#0E1A2B` (dark) and `#F3F6FA` (light), set through `viewport.themeColor` in `layout.tsx`.

---

## 3. Typography Rules

Loaded with `next/font/google` (self-hosted at build time, `display: swap`).

| Role | Family | Weights loaded | Tailwind | CSS variable |
|------|--------|----------------|----------|--------------|
| Headings, big figures | **Space Grotesk** | 500, 600 | `font-display` | `--font-space-grotesk` |
| Body and UI | **IBM Plex Sans** | 400, 500, 600 | `font-sans` (default) | `--font-plex-sans` |
| Dates, stack tags, code | **IBM Plex Mono** | 400, 500 | `font-mono` | `--font-plex-mono` |

No other families. No serif. For emphasis inside a heading, use weight, not a second font.

### Type scale (as implemented)

| Element | Classes | Size (mobile → desktop) | Use |
|---------|---------|-------------------------|-----|
| Hero `h1` | `font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight` | 36 → 48 → 60px | Headline, max 2 lines on desktop |
| Hero sub-line | `text-lg md:text-xl leading-relaxed text-muted max-w-[48ch]` | 18 → 20px | One sentence, under 20 words |
| Section `h2` | `font-display text-3xl md:text-4xl font-semibold tracking-tight` | 30 → 36px | One per section |
| Card / role `h3` | `font-display text-xl md:text-[22px]` (roles `md:text-2xl`) `font-semibold tracking-tight` | 20 → 22/24px | Project titles, job titles |
| Group `h3` | `font-display text-lg font-semibold` | 18px | Skill groups, Certifications, Education |
| Key figure | `font-display text-4xl font-semibold tabular-nums` | 36px | One brief metric per project card, max |
| Lead text | `text-lg leading-relaxed` | 18px | Role summaries, section intros |
| Body | `leading-relaxed text-muted` | 16px | Default paragraphs |
| Meta | `font-mono text-xs tabular-nums text-muted` | 12px | Dates and context lines |
| Tag | `font-mono text-[12.5px] leading-none` | 12.5px | Stack and skill tags |

**Rules**
- Headings use `text-ink`, never the accent.
- Paragraphs cap at `max-w-[65ch]` (`60ch` inside cards).
- `text-wrap: balance` on `h1`, `h2` and `h3` and `text-wrap: pretty` on `p` are set globally.
- `tabular-nums` on dates, GPAs and metrics.
- **No section labels** (small uppercase text above headings). The heading alone names the section.
- **Copy typography:** `…` not `...`, curly quotes, and **no em dashes or en dashes anywhere**. Ranges read “2019 to 2023”, separators use a single `·` per line at most.

---

## 4. Component Stylings

**Shape rule:** controls and tags use `rounded-md` (6px); containers use `rounded-xl` (12px). No pills, no sharp corners.

**Motion rule:** transitions name their properties (`transition-colors`, `transition-[background-color,transform]`), 150ms. Never `transition: all`.

### Buttons and links

| Variant | Classes / behavior |
|---------|--------------------|
| **Primary** (“Download Resume”) | `h-11 px-5 rounded-md bg-accent text-on-accent font-medium`; hover `bg-accent-hover`; active `scale-[0.98]`; leading Phosphor icon |
| **Outline** (nav “Resume”) | `h-9 px-3 rounded-md border border-line text-ink text-sm`; hover border and text turn accent |
| **Icon + label link** (hero GitHub / LinkedIn / Email) | `min-h-11 inline-flex gap-2 text-ink font-medium`; hover `text-accent` |
| **Text link** (`TextLink`) | `text-accent underline decoration-line underline-offset-4`; hover text and underline turn `accent-hover`; external links get `ArrowUpRight` and `rel="noopener noreferrer"` |

- One primary (accent-filled) button per screen. It is the resume download.
- Labels: one to three words, Title Case, specific.
- One label per intent: the resume is “Resume” / “Download Resume” everywhere; contact is the email address itself.
- `<a>` for anything that navigates or downloads, `<button>` only for in-page actions.

### Project card (`OtherProjects.tsx`)

- `rounded-xl bg-raised p-6 md:p-8`, flex column, full height. Transparent 1px border that turns `border-line` on hover.
- Order: meta line (mono date `·` context) → `h3` title → optional key figure + label → outcome (1 to 2 sentences, `text-muted`) → optional team credit → footer row with stack tags and “View Repo” link.
- Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-12`, card spans `7/5, 5/7, 6/6` so rows never look identical.
- Repo links render only when a confirmed URL exists. Missing ones stay `repo: null // TODO: repo link` in data. Never guess a GitHub URL.

### Tags (`TagList`)

`rounded-md bg-tag text-tag-ink font-mono text-[12.5px] px-2 py-1`, in a labelled `<ul>`, each item `translate="no"`.

### Experience role (`Experience.tsx`)

- `lg:grid-cols-12`: role meta (mono dates, `h3` title, org, place) in 4 columns, sticky at `top-24` on desktop; outcomes in 8 columns.
- Short roles: list with a 10px amber tick (`h-px w-2.5 bg-accent`) instead of bullets.
- Roles with labelled engagements (Celebal): two-column grid, each item `border-t border-line pt-4` with a medium-weight label and a muted outcome.
- Outcomes come from the brief only. No generic duties.

### Skills (`Skills.tsx`)

`md:grid-cols-2 lg:grid-cols-3`, no card containers. Each group is a `<section>` with an `h3` and a tag list; Cloud uses a `<dl>` for Azure / AWS / Other sub-groups.

### Certifications and education (`Credentials.tsx`)

Two equal columns on desktop. Each item has a 20px amber Phosphor icon (`Certificate`, `GraduationCap`, `aria-hidden`), then the exact name. Education adds school and a mono line with dates and GPA.

### Navigation (`SiteHeader`)

- `sticky top-0 z-40 h-16 border-b border-line bg-bg/85 backdrop-blur-md`.
- Left: name in Space Grotesk. Right: Projects, Experience, Skills, Contact (`text-muted`, hover `text-ink`, hidden under `md`) and the outline Resume button.
- All elements with an `id` get `scroll-margin-top: 5rem` so the sticky bar never covers a jumped-to heading.

### Contact and footer

- Contact: `h2`, availability line, the email as a large Space Grotesk `mailto:` link (`break-all` so it never overflows), then LinkedIn. No form. No phone number.
- Footer: same theme as the page, `border-t border-line`, copyright left, location right, `text-sm text-muted`.

### Skip link

First focusable element: “Skip to content”, `sr-only` until focused, then a fixed accent-filled chip at top left that jumps to `#main`.

---

## 5. Layout Principles

| Context | Value |
|---------|-------|
| Container | `max-w-[1200px] mx-auto` |
| Side gutter | `px-4` (16px) → `sm:px-6` (24px) → `lg:px-10` (40px) |
| Section padding | `py-20` (80px) → `md:py-28` (112px) |
| Section divider | `border-t border-line` on every section after the hero |
| Section header | `h2` stacked over optional intro, `max-w-[65ch]`, `mb-12 md:mb-16` |
| Hero | `pt-16 pb-20 md:pt-24 md:pb-28`, text in `lg:col-span-7`, diagram slot in `lg:col-span-5` |
| Grid gaps | Cards `gap-5 lg:gap-6`; text columns `gap-x-10` to `gap-x-12`, `gap-y-8` to `gap-y-12` |
| Spacing scale | Tailwind default 4px steps: 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 112 |

**Page order (from the brief):** Hero → About → Featured work (Surplus AI, Watchtower) → Other projects → Experience → Skills → Certifications and education → Contact.

**Variety rule:** each section uses a different layout family (split hero, case study, staggered card grid, sticky-meta timeline, tag columns, two-column list, oversized contact link). No three equal cards in a row.

---

## 6. Depth & Elevation

Flat. Hierarchy comes from tone (`bg` → `raised` → `tag`) and borders, not shadows.

| Level | Treatment | Use |
|-------|-----------|-----|
| 0 | `bg-bg` | Page |
| 1 | `bg-raised` | Project cards, future case-study panels |
| 2 | `bg-tag` | Tags inside cards |
| Overlay | `bg-bg/85 backdrop-blur-md` | Sticky nav only |

No drop shadows, glows or glass panels. **Z-index scale:** nav `z-40`, skip link `z-50`. Nothing else gets a z-index.

---

## 7. Do's and Don'ts

**Do**
- Pull every string from `src/content/portfolio.ts`, and every metric from the brief.
- Use amber for one primary action per screen, plus links, focus and small markers.
- Use Phosphor icons from `@phosphor-icons/react/dist/ssr` (the `*Icon` names), `aria-hidden="true"` when next to a text label.
- Keep every component a Server Component. Diagram motion is pure CSS (`.draw-line`, `.draw-appear`, `.reveal` in `globals.css`), so the site ships no component JavaScript.
- Give diagrams a `<title>` and `<desc>` (or `role="img"` + `aria-label`) that explain the flow in words.

**Don't**
- Don't add a second accent (the brief's old teal stays out), gradients, glows or glassmorphism.
- Don't use em dashes or en dashes, or the banned words: leverage, seamless, robust, cutting-edge, passionate, synergy, spearheaded, utilize, delve.
- Don't write “Senior”, “Lead” or “Architect” titles, real client names, or more than “two years” of experience.
- Don't call Watchtower shipped, deployed or in production, or claim the 14B cluster is serving requests.
- Don't add testimonials, logo walls, GitHub stats, visitor counters or “trusted by” sections.
- Don't put the phone number anywhere.
- Don't use section labels, numbered headings, scroll cues or decorative dots.
- Don't disable zoom or use `transition: all`.

---

## 8. Responsive Behavior

| Breakpoint | Width | Changes |
|-----------|-------|---------|
| base | < 640px | Everything single column; nav shows name + Resume only; email link 24px |
| `sm` | ≥ 640px | Celebal outcomes go two columns; email link 30px |
| `md` | ≥ 768px | Nav links appear; project grid 2 columns; larger section padding and type |
| `lg` | ≥ 1024px | 12-column grids: staggered project spans, sticky role meta, split hero, 3-column skills |
| container cap | 1200px | Content stops growing |

- Checked at a true 390px width: no horizontal overflow.
- Touch targets at least 44px (`h-11`, `min-h-11`); `touch-action: manipulation` on links and buttons.
- `prefers-reduced-motion: reduce` turns off smooth scrolling, transitions and animations globally. The pipeline diagram must show its finished state immediately.
- Below-fold images get `loading="lazy"` and explicit `width`/`height`.
- Static export (`output: "export"`) builds to `out/` for GitHub Pages or Vercel.

---

## 9. Agent Prompt Guide

### Quick reference

```
                 dark       light
Background       #0E1A2B    #F3F6FA   bg-bg
Raised           #15253B    #E6ECF4   bg-raised
Border           #2A3F5C    #C3CEDC   border-line
Text             #E7EDF5    #0E1A2B   text-ink
Muted            #9DB0C8    #46566E   text-muted
Accent           #F0B44C    #8A5600   text-accent / bg-accent
Accent hover     #F5C773    #6E4400   *-accent-hover
On accent        #0E1A2B    #F3F6FA   text-on-accent
Tag              #1D3150    #DCE4EE   bg-tag + text-tag-ink (#C9D6E6 / #26364D)

Fonts   Space Grotesk 500/600 (font-display)
        IBM Plex Sans 400/500/600 (font-sans)
        IBM Plex Mono 400/500 (font-mono)
Radius  rounded-md controls and tags, rounded-xl containers
Layout  max-w-[1200px], px-4/6/10, sections py-20 md:py-28
Dials   variance 6, motion 3, density 4
```

### Built so far

About, Featured work (Surplus AI with pipeline, network and privacy-layer diagrams; Watchtower with the agent-flow diagram), the hero pipeline diagram, Other projects, Experience, Skills, Certifications and education, and Contact are all in `src/app/page.tsx`.

### Diagram pattern

- **Hero diagram** (`HeroDiagram.tsx`): inline SVG, `role="img"` with `<title>` and `<desc>`. Lines use `pathLength={1}` and `.draw-line`, boxes use `.draw-appear`, staggered with a `--d` delay. No JS.
- **Case-study diagrams** (`diagrams.tsx`): semantic HTML lists inside a `bg-raised rounded-xl` `<figure>` with a `<figcaption>`. Nodes are `rounded-md border bg-bg`; the key node gets `border-accent`; inputs and outputs get a dashed border. Arrows are decorative Phosphor `ArrowRight`, rotated 90° under `lg`. Panels fade in on scroll with `.reveal` (CSS scroll-driven, only where supported and motion is allowed).
- **State markers:** a filled amber dot means running, a hollow amber ring means in progress. Always pair the dot with text.

### Ready-to-use prompts

- *“Add a theme toggle button to the nav that sets `data-theme` on `<html>`, has an `aria-label`, and remembers the choice in `localStorage` inside a try/catch.”*
- *“Add a new project to `otherProjects` in `src/content/portfolio.ts` using only facts and numbers from PORTFOLIO_BRIEF.md.”*

### Pre-flight before shipping

1. Run the TasteSkill section 14 checklist and the Vercel Web Interface Guidelines review.
2. Search `out/index.html` for em dashes (U+2014), en dashes (U+2013) and the banned words. Require zero matches.
3. Check every metric on the page against `PORTFOLIO_BRIEF.md`.
4. View the page in dark mode, light mode and at 390px wide.
