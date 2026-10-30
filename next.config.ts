import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static site: `next build` writes plain HTML/CSS/JS to `out/` for GitHub Pages or Vercel.
  output: "export",
  images: { unoptimized: true },
  // GitHub Pages serves the site under /srujan-portfolio; CI sets the env var
  // (configure-pages injects the same value, which is harmless). Local builds have no prefix.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
};

export default nextConfig;
