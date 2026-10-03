import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static site: `next build` writes plain HTML/CSS/JS to `out/` for GitHub Pages or Vercel.
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
