import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static site: `next build` writes plain HTML/CSS/JS to `out/` for GitHub Pages or Vercel.
  output: "export",
  images: { unoptimized: true },
  // GitHub Pages serves the site under /srujan-portfolio; CI sets the env var
  // (configure-pages injects the same value, which is harmless). Local builds have no prefix.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  // The poster studio (src/app/studio/*.studio.tsx) is a route only when POSTER_STUDIO=1, for
  // `npm run posters` against a dev server; the published export never contains it (V7).
  pageExtensions: process.env.POSTER_STUDIO ? ["studio.tsx", "tsx", "ts", "jsx", "js"] : ["tsx", "ts", "jsx", "js"],
};

export default nextConfig;
