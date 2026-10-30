---
name: static-export-check
description: How this repo builds and deploys as a Next.js static export on GitHub Pages, and the asset-path pitfalls that break it. Load before touching next.config.ts, routing, new routes, images, fonts, public/ assets, fetch() of local JSON, env vars, the GitHub Actions workflow, link hrefs that start with "/", or anything deploy-related. Also load when verifying a build or serving the site locally.
---

# Static export check

## How the site is built and deployed (verified in Phase 0, `docs/REDESIGN_NOTES.md` §2)

- `next.config.ts`: `output: "export"`, `images: { unoptimized: true }`. No `basePath`, `assetPrefix`, or `trailingSlash` in the repo.
- `npm run build` writes plain HTML/CSS/JS to `out/` (`index.html`, `404.html`, `_next/static/...`, RSC `.txt` payloads). `npm run start` is a dead template leftover; never use it.
- Deploy: push to `main` runs `.github/workflows/nextjs.yml`. `actions/configure-pages@v5` with `static_site_generator: next` rewrites `next.config.ts` inside the runner to inject `basePath: "/srujan-portfolio"`, then `next build` on Node 20, then `upload-pages-artifact` + `deploy-pages`. There is no `gh-pages` branch. Do not change this mechanism (runbook Phase 11); adding an `env:` line to the build step is allowed when a phase needs it.
- Live URL: https://srujanrudrapati.github.io/srujan-portfolio/ . Local dev and local `out/` have no prefix, so local and CI differ by exactly the `basePath`.
- `.nojekyll`: not strictly needed for artifact deploys, but runbook rule 6 says keep it. Add an empty `public/.nojekyll` so it lands in `out/`.

## The one pitfall that has already broken production

`basePath` rewrites only `next/link`, `next/image`, and Next's own asset URLs. A raw string such as `<a href="/resume.pdf">` or `fetch("/graph.json")` is NOT rewritten, so on the live site it points at the domain root and 404s. `profile.resume = "/resume.pdf"` is broken live today for this reason (and `public/` is empty, so the file is also missing).

Rule: every root-relative URL that is not a `next/link` goes through one helper, `withBasePath(path)` in `src/lib/paths.ts` (create it in Phase 5 if absent), which prefixes `process.env.NEXT_PUBLIC_BASE_PATH ?? ""`. Wire the value in `next.config.ts` (`basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined`) and set `NEXT_PUBLIC_BASE_PATH=/srujan-portfolio` as `env:` on the workflow's build step. `configure-pages` setting the same value again is harmless. Then a local CI-parity build is one command (below). In-page anchors (`#work`) and `mailto:` need no prefix.

## What static export forbids

No API routes, Server Actions, middleware, `headers()`/`redirects()`/`rewrites()` in config, `next/image` optimisation, `cookies()`/`headers()` at request time, dynamic routes without `generateStaticParams`, or `revalidate`. Anything server-side lives in the separate Cloudflare Worker (Phase 8) and is called with `fetch` from the client, guarded so the site works when it is absent. `"use client"` components are fine; they hydrate from static HTML. Data files the browser fetches (`graph.json`, `search-index.json`) are written to `public/` by `scripts/build-graph.ts` in `prebuild` so they ship inside `out/`.

## Commands

```sh
npm run lint && npx tsc --noEmit            # lint + typecheck
npm run build                                # export to out/
npx serve out -l 4321 --no-clipboard         # serve like Pages (no prefix): http://localhost:4321/
# CI-parity build once NEXT_PUBLIC_BASE_PATH is wired (Phase 5+):
NEXT_PUBLIC_BASE_PATH=/srujan-portfolio npm run build && npx serve out -l 4000 --no-clipboard
#   then open http://localhost:4000/srujan-portfolio/
npm run verify -- --phase N                  # screenshots, axe, console, overflow (phase-verify skill)
npm run release:check                        # release gate: CI-parity build, then every required file and link in out/
npm run release:check -- --no-build          # check the existing out/ only
```

`release:check` defaults `NEXT_PUBLIC_BASE_PATH` to `/srujan-portfolio` and rebuilds first. Before that fix it read a stale `out/` and an unset env var, and it falsely reported `resume.pdf` and `favicon.ico` missing. With `--no-build` it refuses an `out/` built under a different prefix and says so. It does not report the files as missing. For an unprefixed check, run `NEXT_PUBLIC_BASE_PATH= npm run release:check`.

## Checklist before any commit that touches paths, config, or assets

- [ ] `npm run build` passes and `out/index.html` exists.
- [ ] `grep -rn 'href="/' out/index.html | grep -v '_next'` shows only paths you expect; each one is produced by `withBasePath` (or `next/link`).
- [ ] Every file referenced from `public/` exists in `out/` (`resume.pdf`, `graph.json`, `search-index.json`, OG image, `.nojekyll`).
- [ ] No `fetch("/...")` without `withBasePath`.
- [ ] Nothing in the list of forbidden features above was added.
- [ ] Fonts still come from `next/font` (self-hosted at build; no external stylesheet).
- [ ] No new routes beyond `/` without `generateStaticParams` (`/design-preview` was removed in Phase 10).
- [ ] Live check after deploy (Phase 11): `curl -I` the home page, `resume.pdf`, `graph.json`, and every `_next` asset URL parsed from the HTML returns 200.
