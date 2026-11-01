---
name: motion-system
description: The motion rules for the v4 portfolio (Midnight & Bronze): one easing, durations, page transitions via the View Transitions API, the home dot field (2D canvas spring physics and its performance contract), custom cursor, magnetic buttons, Lenis smooth scroll, the catalogue and list morph, and reduced motion. Load whenever adding or changing any animation, transition, hover, scroll effect, canvas, or interaction.
---

# Motion system (v4)

Rewritten at Phase W0 from runbook v4 §10 and the reference (`docs/v4/reference/srujan-premium-concept.html`). v3's GSAP scroll primitives, WebGL stage, posters and physics scenes are retired in W7; nothing new may use them. Colours and layout: `design-direction`.

## Rules

- **One easing:** `cubic-bezier(.16,1,.3,1)` (`--ease`). No other curve, except `ease` on the 260 ms fade-out.
- **Durations:** entrances 800 ms; hovers 300 to 600 ms; toggles and morphs 800 ms; fades 260 ms. The home headline lines rise over 1.2 s with a 90 ms stagger (reference).
- **Only `transform` and `opacity` animate**, plus `width` on the progress pills and the segmented-control highlight (and colour/border/background on hover, which do not trigger layout).
- **The dot field is the only ambient motion.** Everything else answers a person's action. The live dot's pulse is the one exception (a 2.4 s box-shadow pulse on an 8px element).
- **Nothing in JS animates layout.** Positions are written as `transform`; pointer-driven values go through CSS variables.
- **Banned:** animated full-screen overlays, `mix-blend-mode` on large layers, `backdrop-filter` outside the header, `filter` transitions on large elements, `shadowBlur` in canvas loops, `background-attachment: fixed`, GSAP, WebGL, any animation runtime.

## Page transitions

- On an internal route change: the old page fades out over 260 ms; the new page enters over 800 ms from 14px below with `--ease`. Use `document.startViewTransition` where supported (root old: opacity to 0 in 260 ms; root new: from `opacity 0, translateY(14px)` in 800 ms, delayed so it starts as the old one ends); otherwise a CSS class fallback on `main` with the same numbers.
- After the swap: scroll resets to the top (Lenis `immediate`), focus moves to the new page's `h1` (`tabindex="-1"`, no visible outline), the cursor label resets.
- The Work Catalogue ⇄ List toggle is a separate view transition: `html.vt-toggle` turns off the root cross-fade; each project has three names (`wi-N` row/card, `wa-N` art, `wn-N` name), groups animate 800 ms with a 60 ms stagger per item. No View Transitions API: instant switch.
- Reduced motion: every transition is instant.

## Dot field (home)

A 2D canvas client component. Shapes ported from the reference: `idle` (three streams converging into a ring with a short output line), `work` (three overlapping plates), `experience` (timeline bars, an axis and a milestone diamond), `about` (head and shoulders), `contact` (envelope). Hovering or focusing a tile switches the target shape; leaving the tile row returns to idle.

- **Physics:** per-dot spring toward the target, k between 0.018 and 0.048; velocity damping 0.86; a sine wobble of 0.004 units; cursor repulsion within 60px.
- **Colour:** steel-white `rgba(214,224,236,.6)` and about 18% bronze `rgba(226,197,158,1)` with a wider glow.
- **Performance contract (required):** one pre-rendered glow sprite per colour drawn with `drawImage` (never `shadowBlur`, never per-dot gradients); 1100 dots, 700 under 700px wide; device pixel ratio capped at 2; target shapes computed once per shape and cached; no per-frame allocation. Full-rate frames only while the field has energy; when total squared velocity is about 0, drop to about 12 fps for the wobble; wake on tile hover/focus or the cursor coming within 60px. Stop entirely when off screen (IntersectionObserver), on hidden tabs (`visibilitychange`) and when the home route unmounts.
- **Reduced motion:** draw the target shape once, no loop; redraw once on tile hover/focus.

## Cursor and magnetic

- Only with `(hover: hover) and (pointer: fine)` and not under reduced motion. A 34px bronze ring (lerp 0.18 toward the pointer) and a 5px bronze dot (exact). The ring grows to 58px over links and buttons; over the catalogue's front card it becomes an 84px solid bronze disc labelled "Open", over the rest of the stage "Drag". The native cursor stays (text fields keep their I-beam). The label resets on route change. Both are `aria-hidden` and `pointer-events: none`.
- Magnetic: arrow buttons, back pills and main buttons move up to 25% of the pointer offset toward the pointer (transform only) and spring back on leave over 600 ms with `--ease`.

## Smooth scroll

Lenis with `lerp: 0.09`, its own rAF loop, off under reduced motion and on touch. Native scroll underneath so keyboard, anchors and find-in-page keep working. The header's frosted state and the 1px metal progress line (scaleX of scroll position) read the native scroll position with a passive listener and write one transform per frame.

## Hero headline

Three lines, each in an `overflow: hidden` mask with `padding-bottom: .16em; margin-bottom: -.1em` so descenders are never clipped; the inner span rises from `translateY(105%)` over 1.2 s, 90 ms stagger, on first load only. Lines do not wrap on desktop (`white-space: nowrap` above 560px). Under reduced motion the lines are simply there.

## Reduced motion (full alternate mode)

Instant page transitions and toggles, static dots, no cursor, no magnetic, no headline reveal, no Lenis, no pulse. Every page must read completely in this mode.

## Not allowed

Autoplay sound, scroll-jacking, preloaders that block content, intro screens, animation of layout properties, third-party CDN requests.
