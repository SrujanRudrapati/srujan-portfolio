# v3 reference teardown (Phase V0)

Captured 2026-10-30 with Playwright (Chromium headless) at 1440×900 and 390×844 (touch emulation). Each site: first screen after load, then eight steps of one viewport height (wheel input, so smooth-scroll libraries respond; mobile fell back to `scrollTo` where wheel did nothing). Screenshots in `docs/v3/refs/<site>/<desktop|mobile>/`; extra interaction captures in `explore/`. Scroll videos (`scroll.webm`) were recorded but are kept out of git (third-party recordings, about 21 MB); re-create them with the capture script noted in STATUS. Raw measurements (fonts, colours, libraries, sticky elements, intro timings) are in `teardown.json` and `teardown-explore.json`.

All four sites loaded; none blocked automation. Libraries were detected from globals and the `lenis` class on `<html>`; GSAP and Three.js are bundled as modules on these sites, so "not detected" below means "not exposed globally", not "absent".

These sites are inspiration only. Nothing here is copied: no code, assets, fonts, copy, or one-to-one layouts (v3 runbook §1).

---

## 1. eddy-naboulet.dev — the fake operating system

- **Concept.** The whole site is "EDDY-OS": a CRT-styled desktop. Sections are files with extensions that describe them (`projets.vol` projects, `parcours.log` résumé, `profil.sys` profile, `contact.app`). The metaphor is carried into every label, including the boot log ("design memory ... 15 years", "coffee.sys ... running low").
- **Structure.** Astro, multi-page: `/` (desktop), `/projets` (project volume), `/projet/<slug>` (17 case studies), `/cv`, `/contact`. Projects are opened like windows over the desktop with "ESC — close project".
- **Navigation.** Four numbered icons pinned to the screen corners around the name; a menu bar (File / Extras / System) with keyboard hints (`1`–`4`, ⌘P print résumé, ⌘K palette); breadcrumbs `~/desktop / projets.vol / The Safe Box`. The command palette lists every project and action.
- **Type.** A pixel blackletter display face plus a pixel mono for everything else. Display reaches about 190 px on desktop, 56 px on phones. All small text is mono and small; legibility suffers at body sizes.
- **Palette.** Phosphor amber on near-black: background `#14100A`, text `#FFE2B0`, accent `#FFA02E`, a red-orange `#E0501E`. Six alternate themes in a System menu. Effectively 3–4 colours per theme.
- **Scroll.** Almost none: the document is exactly one viewport high (900 px). Content lives in fixed windows; the project volume is a draggable canvas with three views (sphere, index, gallery). Lenis present.
- **Transitions.** The name types/scrambles in letter by letter; a particle field forms around it; windows open over the desktop.
- **Micro-interactions.** Sound on by default ("[S] SOUND: ON"), CRT toggle, theme switcher, a playable Doom easter egg, "Surprise me". Images are dithered to the palette.
- **Boot screen.** Blocks the site until "PRESS ANY KEY TO ENTER". Content is in the HTML underneath (the DOM listed all projects before entering), so crawlers see it.
- **CV.** Rendered as a `git log` with a branch graph (13 steps, 4 branches) and a `git checkout <hash> && git show` prompt per entry. A PDF button prints it.
- **Mobile.** Same boot gate (tap to enter), the four corner icons and the name; the OS metaphor survives but with much smaller display type.
- **Take.** The strongest *concept* of the four: everything is named in one vocabulary, and the CV-as-git-log turns a dull list into something on-concept. The cost is a hard gate before any content and a lot of novelty to learn before reading.

## 2. mijobello.com — typographic grid with photographs

- **Concept.** No metaphor; a personal identity ("bello.") set on a visible grid of hairline cells, with black-and-white photography.
- **Structure.** Next.js. Home flows hero → "the developer." (bio) → "selected works." (carousel) → "my services." → "want to chat?" → footer. About and works pages exist behind the nav.
- **Navigation.** Fixed top bar: wordmark, a ticker of world clocks (Brisbane, Sydney, Tokyo, Berlin, London, New York, LA) with the local one highlighted, light/dark toggle, menu button. Footer repeats About / Works / Contact in large grid cells.
- **Type.** One family, Space Grotesk, used from small tracked labels to a 432 px wordmark. Headings are lower-case with a full stop ("works.", "chat?").
- **Palette.** Two colours: sage `#B2C7AB` and oxblood `#6A0C06`, swapped for the footer. Five computed colours in total.
- **Scroll.** Lenis inertial scroll; images slide inside their cells; the giant wordmark is clipped by the bottom of the footer.
- **Transitions / intro.** A preloader draws a perspective grid "room" in hairlines with a counter (073…). Network idle took about 14 s on this connection (heavy imagery).
- **Micro-interactions.** Live clocks, outlined "LEARN MORE" buttons, carousel arrows.
- **Mobile.** The grid collapses to one column of stacked cells; type stays large; works well.
- **Take.** Two colours and one typeface are enough when the grid is visible and the type is huge. The clocks show that a small live element can carry personality.

## 3. cartooneast.in — a character who walks you through the page

- **Concept.** A felt-puppet version of the designer is the guide. He changes pose per section (waving, walking, at a desk, on a bike, sunglasses at the end).
- **Structure.** Next.js, one page: "Hi, I design. Brands grow. Simple." → Works (folder-icon list) → "The Design Journey" (dotted-line timeline of employers) → notable collabs (logo row) → "This Is Where It Gets Personal" (card stack) → "You've Reached The End. Or The Beginning." contact.
- **Navigation.** Only a hamburger; no visible nav. Works are a list of folder icons.
- **Type.** One rounded sans (Quicksand), 80 px max on desktop, 48 px on phones.
- **Palette.** Off-white `#F5F5F5`, near-black `#1C1C1C`, black buttons; colour comes only from the puppet and logos.
- **Scroll.** Wheel input did not move the page in the headless desktop run (PageDown did), which suggests the sections are scroll-snapped full screens with the character fixed. On phones it scrolls normally and the character sits under the text.
- **Intro.** Network idle took about 16 s (large character images).
- **Micro-interactions.** Card stack, "Download Resume" pill always at the bottom.
- **Take.** One recurring element that changes state per section makes a short page feel like a story. The end screen ("Or The Beginning.") is a nice loop back. Heavy images and snap scrolling are the costs.

## 4. russellnumo.nl — two colours, one huge condensed face

- **Concept.** Pure typography: a near-black and white site where the display type is the image.
- **Structure.** Next.js. Home: marquee hero ("FRONTEND DEVELOPER / UX/UI DESIGNER / CREATIVE" in three rows moving in opposite directions) → (01) About → "FEATURED WORK" (pinned title, projects scroll past with "(01) RESEARCHER & DEVELOPMENT 2026") → a manifesto paragraph that lights up word by word as you scroll → services list with small inline images → "GET IN TOUCH" on black.
- **Navigation.** Stacked wordmark top-left; "01 About / 02 Projects / 03 Contact" top-right (menu button on phones); GitHub, LinkedIn, Instagram in the footer.
- **Type.** A very condensed display face (Humane) up to about 260 px, paired with a neo-grotesque (Neue Montreal) for body. Section numbers in parentheses.
- **Palette.** White `#FFFFFF`, ink `#1A202C`, black `#000` for the contact section; one green status dot. Greys are opacity steps of the two.
- **Scroll.** Lenis; marquee speed responds to scroll; scroll-scrubbed text reveal (words go from 20 % to 100 % opacity as they pass the reading line); pinned "FEATURED WORK" heading; the page flips to dark for contact.
- **Intro.** A black preloader with a counter and a joke label ("CLUTCH GOD 71%"); the `intro-loading` class was removed after about 6.6 s. Under `reducedMotion: 'reduce'` the intro and Lenis still ran.
- **Mobile.** Same sequence, marquee cropped, type still huge; the reveal paragraph works with touch scroll.
- **Take.** Closest to the minimal-and-striking brief: two colours, one display face, and motion that is *about reading* (the paragraph lighting up). The 6.6 s preloader and ignored reduced-motion setting are exactly what to avoid.

---

## What to borrow as principles

1. **One vocabulary, carried everywhere.** Eddy names every section, button and error in the OS's language. Whatever concept wins, its words should appear in nav labels, the 404, the CV, and the palette, not only in the hero.
2. **The CV can be on-concept and still a CV.** A `git log` CV works because the format already means "history". Pick a format from Srujan's own field that already means "record" (a pipeline run log, a query plan, a notebook) and keep it printable.
3. **Two neutrals and huge type are enough.** Mijobello (two colours) and Russell Numo (two plus opacity steps) look more striking than sites with full palettes. Spend contrast on scale, not hue.
4. **Scroll should reveal reading, not hijack it.** The best moment in the set is Russell's paragraph lighting up word by word: the page still scrolls normally, the motion just follows the reader.
5. **One recurring element that changes state per section** (Cartooneast's puppet) turns a short page into a sequence. For a data engineer the equivalent is a record or a data line that changes form at each stage.
6. **Pin the heading, scroll the evidence.** Russell pins "FEATURED WORK" while projects pass beneath it; it keeps the reader oriented in a long list without a sticky nav.
7. **A command palette and number keys** give power users a fast path (Eddy's ⌘K and `1`–`4`) without adding visible chrome.
8. **Content in the HTML under any intro.** Eddy's boot screen still ships all project text in the DOM; whatever we do in the intro, crawlers and screen readers must get the page.
9. **Case studies as their own routes** (Eddy's `/projet/<slug>`), with breadcrumbs that keep the metaphor, so the home page can stay short.
10. **A small live detail** (Mijobello's clocks, Eddy's availability indicator) makes a static site feel switched on. For Srujan it should be a real fact (status: in production, available early 2027), not decoration.
11. **The end of the page can loop back** ("You've reached the end. Or the beginning."): end the home story at contact with a way back into the work.

## What to avoid

- **Long blocking preloaders.** Russell's intro took about 6.6 s; Mijobello and Cartooneast reached network idle at 14–16 s because of imagery. A recruiter on a phone leaves. Our cap is 1.2 s, first visit only, skippable (runbook V2).
- **Gates before content.** "Press any key to enter" is charming once and a wall for a recruiter with 30 seconds.
- **Sound on by default** (Eddy). Off by default, if at all.
- **Ignoring `prefers-reduced-motion`.** Russell ran its intro and Lenis under reduced motion. Ours must be a full alternate mode.
- **Snap or wheel-jacked scrolling that fights the user** (Cartooneast's desktop did not respond to the wheel in automation). Native scroll position must always move with input.
- **Tiny mono text for everything.** Eddy's pixel mono is unreadable at body sizes. Mono only for short labels; body text 16 px or more in the main face.
- **Heavy photography as the main visual.** We have no portrait shoot; the visual has to come from type, diagrams and numbers that we already own.
- **Novelty that hides the answer.** Every concept must still answer who, what, proof and contact within two screens (runbook V4).
- **Infinite marquees and ambient loops** that never pause; they cost battery and attention. One ambient element at most, paused offscreen.
