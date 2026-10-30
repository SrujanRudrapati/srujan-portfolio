---
name: motion-system
description: The motion and 3D rules for the v3 portfolio (Pipeline concept): smooth scroll, GSAP scroll primitives, page transitions, the shared WebGL canvas, physics, posters and fallbacks, reduced motion, and performance budgets. Load whenever adding or changing any animation, scroll effect, transition, interaction, WebGL scene, physics simulation, or 3D asset.
---

# Motion system (v3)

Written at Phase V1.5 (pulled forward from runbook V2 item 1 because all 3D work loads it); V2 extends it with the primitives' APIs. Concept and colours: `design-direction`. 3D API detail: the `threejs-*` skills.

## Signature

One record travels the pipeline. Scrolling moves it down a thin rail through `ingest`, `transform`, `serve`, `query`; at each stage it changes state (bronze `raw`, silver `cleaned`, gold `modeled`, accent `answer`) and that stage lights. The hero is the same idea in 3D: a particle stream that falls as bronze noise, is pulled into silver lanes, glows gold and condenses into the headline. Everything else is quieter than this.

## GSAP and scroll rules

- Lenis (lerp about 0.1, touch smoothing off) on GSAP's ticker, synced with ScrollTrigger. Anchors and keyboard scrolling keep working. Off under reduced motion.
- Animate only `transform`, `opacity`, `clip-path` and SVG stroke in the DOM.
- One easing family: `power3.out` for entrances, `none` for scrubs. Entrances 500 to 900 ms; hovers 150 to 250 ms.
- Nothing loops forever except the concept's ambient element (the hero stream); it pauses off screen and when the tab is hidden.
- Pins only at 768 px and wider unless tested on touch. Horizontal reels become native swipe with snap on mobile.
- Kill every ScrollTrigger on route change; a Playwright test navigates back and forth 10 times and counts triggers, live WebGL views and physics worlds.
- Count-ups: the real figure is in the HTML and in `data-count` from the start; `~` stays.
- Page transitions at most 600 ms (the data line sweeps across); focus moves to the new `h1`; under reduced motion a fade of at most 150 ms.

## 3D rules

- **One canvas.** A single fixed `<Canvas>` (R3F) behind the page renders every scene through drei `View` slots tied to DOM elements. Never mount a second WebGL context. The canvas is created after first paint (dynamic import plus idle callback), never in the server HTML.
- **Only on screen.** A scene renders and simulates only while its slot intersects the viewport (IntersectionObserver plus a margin). Off-screen physics worlds stop stepping; settled bodies sleep (`allowSleep`, sleep thresholds tuned so a settled pallet costs nothing). The frame loop drops to `demand` when nothing is visible or moving.
- **Poster first.** Every scene has a static poster (`public/posters/<scene>.webp` plus `.avif`, same framing as the live scene) rendered ahead of the build by `npm run posters`. The poster is the slot's background from the first paint; the live view fades in over it (150 ms) once its first frame is ready. The poster is all a visitor sees under `prefers-reduced-motion: reduce`, on low-power devices (`navigator.hardwareConcurrency <= 4` or `deviceMemory <= 4` or Save-Data), and when WebGL is missing or the context is lost.
- **Physics.** cannon-es (decision and sizes in V3 STATUS, Phase V1.5): fixed step 1/60 with at most 3 substeps, real gravity (-9.82), contact materials with friction and restitution per material pair, SAP broadphase, sleep on. Motion comes from forces, impulses and constraints, not keyframes; scroll may drive a force or a kinematic body, never a body's position directly.
- **Particles.** The hero stream integrates forces itself (gravity, a lane field, drag, cursor repulsion) on the CPU into an `InstancedMesh` or `Points` buffer; no per-frame allocation. Mobile uses about a third of the desktop count.
- **Look.** AgX tone mapping, sRGB output, one CC0 studio HDRI for image-based light (loaded once, PMREM'd once, shared), at most one shadow-casting light, contact shadows for floors, AO via post-processing, subtle depth of field, bloom only on emissive gold/LLM elements. DPR clamped to [1, 1.5] desktop and [1, 1.25] mobile.
- **Assets.** CC0 only (Poly Haven, ambientCG) or built in code; recorded in `docs/v3/ASSETS.md`. Textures KTX2 (ETC1S colour, UASTC normal), at most 1k; models meshopt or Draco; decoders self-hosted under `public/three/`. Budget about 1.5 MB of 3D assets per page, counted by `npm run verify`. No brand logos, liveries or trademarks.
- **Interaction.** Click or tap flicks a body with an impulse; the cursor is a gentle force on desktop (`pointer: fine`) only. 3D is decorative for assistive tech: the slot has `role="img"` and an `aria-label` describing the scene; the content it illustrates is always in the DOM text.
- **Performance target.** 60 fps on a mid-range laptop with the hero and one physics cover on screen; initial page JS budget unchanged (the 3D chunk loads after first paint).

## Reduced motion

A full alternate mode: Lenis off, nothing pinned or scrubbed, entrances skipped, no WebGL started (posters only), page transitions are fades of at most 150 ms. Every page must read completely in this mode.

## Not allowed

Autoplay sound, scroll-jacking that fights the wheel, preloaders that block content, animation of layout properties, WebGL on the server, third-party CDN requests for decoders, HDRIs or fonts.
