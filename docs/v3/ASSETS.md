# 3D and image assets (v3, Phase V1.5)

Every asset the site ships for its 3D layer, with source and license. Only CC0 sources (Poly Haven, ambientCG), models built in code, the project's own renders and screenshots, and open-source decoders. No brand logos, liveries or trademarks anywhere. Re-create everything with:

```sh
npm run assets:fetch   # downloads the CC0 sources into assets-src/3d/ (git-ignored), checks the HDRI's md5
npm run assets:build   # compresses them into public/three/ (KTX2, gain-map HDRI, self-hosted transcoder)
npm run posters        # renders public/posters/*.webp from /lab/posters (needs a served build or dev server)
```

Source list in code: `scripts/assets/sources.mts`.

## Textures (ambientCG, CC0 1.0)

All ambientCG assets are CC0 1.0 Universal (public domain), https://docs.ambientcg.com/license/. Downloaded as the 1K-JPG packs; we ship only the maps we use, resized and compressed to KTX2 (Basis Universal: ETC1S for colour and roughness, UASTC with RDO and Zstandard for normals).

| Material | ambientCG asset | URL | Shipped (public/three/tex/) | Bytes |
|---|---|---|---|---|
| Cardboard (boxes) | Cardboard004 | https://ambientcg.com/view?id=Cardboard004 | `cardboard-color` 512, `cardboard-normal` 256, `cardboard-orm` 512 | 49,047 + 26,545 + 21,332 |
| Aluminium (compute units, conveyor frame, column base) | Metal051A | https://ambientcg.com/view?id=Metal051A | `aluminium-orm` 512 (roughness only) | 11,947 |
| Wood (pallet) | Wood049 | https://ambientcg.com/view?id=Wood049 | `wood-color` 512, `wood-normal` 256, `wood-orm` 512 | 51,790 + 53,921 + 24,892 |
| Plastic (bottle cap, electronics) | Plastic010 | https://ambientcg.com/view?id=Plastic010 | `plastic-normal` 256, `plastic-orm` 512 | 24,352 + 25,646 |
| Paper (label, word bricks) | Paper003 | https://ambientcg.com/view?id=Paper003 | `paper-color` 512, `paper-normal` 256, `paper-orm` 512 | 15,909 + 44,120 + 10,631 |

`*-orm` files carry roughness in the green channel (three's `roughnessMap` channel); red is 1, blue 0. Aluminium ships without its albedo and normal map: at cover size the albedo read as dark speckle and the circular-brush normals as cracks, so the material uses a flat light base colour and the scan's roughness only.

## Environment light (Poly Haven, CC0 1.0)

| Asset | Author | URL | Shipped (public/three/env/) | Bytes |
|---|---|---|---|---|
| Studio Small 09, 1k HDR | Sergej Majboroda | https://polyhaven.com/a/studio_small_09 | `studio-sdr.jpg` + `studio-gain.jpg` + `studio.json` (a gain map: sRGB base, gain JPEG, metadata) | 51,050 + 37,329 + 243 |

Poly Haven assets are CC0 1.0 (https://polyhaven.com/license). The 1.6 MB `.hdr` is encoded to a gain map with `@monogrid/gainmap-js` (already a dependency of drei) in headless Chromium and decoded on the GPU at runtime, then prefiltered once (PMREM) and shared by every scene. File md5 of the source: `d5d7eb9d26d341d6aa4d11c1a54fd97c`.

## Models (built in code)

No model files are downloaded. Every object is built from three.js primitives in the scene components and has no brand marks:

| Scene | Objects | File |
|---|---|---|
| Hero stream | Icosahedron particles (instanced), soft halo sprites | `src/components/three/scenes/HeroStream.tsx` |
| Surplus AI | Roller conveyor (instanced rollers, frame, legs), four compute units (rounded boxes with a status strip), a pallet (boards and blocks), cardboard boxes, a generic laptop, tablet, router, keyboard and drive | `SurplusLine.tsx`, physics in `surplus-sim.ts` |
| Label Lens | A lathed amber glass bottle, plastic cap, printed paper label (generic text drawn to a canvas, no product or brand), word bricks, an acrylic column on an aluminium base | `LabelLens.tsx` |

Because there are no glTF files, no Draco or meshopt decoder is shipped. If a later scene needs a model file, it must be CC0 or self-built, compressed with meshopt (`gltf-transform`, pinned as a dev dependency) and listed here, with the decoder self-hosted.

## Decoders (self-hosted)

| File | Source | License | Bytes (gzip) |
|---|---|---|---|
| `public/three/basis/basis_transcoder.js`, `.wasm` | three.js `examples/jsm/libs/basis/` (Binomial Basis Universal transcoder), copied by `npm run assets:build` | Apache 2.0 | 57,529 (15,083) + 527,333 (244,575) |

Never loaded from a CDN (the third-party skill examples point at gstatic and jsDelivr; we do not).

## Posters (own renders)

`public/posters/<scene>.webp`, rendered by `npm run posters` from `/lab/posters`: the same scene code, seeded and run forward to a settled frame, captured with a transparent background so one poster serves both themes. Shown first, under reduced motion, on low-power devices and if WebGL fails.

| Poster | Bytes |
|---|---|
| `hero-stream.webp` (7:5) | about 71 KB |
| `hero-stream-portrait.webp` (4:5, phones) | about 105 KB |
| `surplus-line.webp` | about 16 KB |
| `label-lens.webp` | about 26 KB |

## Screenshots (own projects)

| File | What | Captured by |
|---|---|---|
| `public/images/projects/label-lens-app.webp` (1280×800), `label-lens-app-phone.webp` (390×844 @2x) | The live Label Lens app, https://label-lens-iota.vercel.app (Srujan's project, portfolio-facts 2.3) | `scripts/capture-label-lens.mts` (Playwright), 2026-10-30 |

## Photo slots

`public/images/portrait.jpg`, `hackathon.jpg`, `surplus-station.jpg`: empty until Srujan adds his own photos (DECISIONS 12, `public/images/README.md`).

## Budget per page (target: about 1.5 MB of 3D assets)

`/lab/a` (hero + Surplus AI + Label Lens covers) loads every texture above, the HDRI and the transcoder: about 360 KB of KTX2, 88 KB of HDRI and 585 KB of transcoder (260 KB over the wire with gzip), about 1.03 MB raw in total. The 3D JavaScript (three, fiber, drei parts, cannon-es, scenes) loads after first paint in separate chunks; sizes are recorded in STATUS.
