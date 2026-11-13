import type { Metadata } from "next";
import Link from "next/link";
import { withBasePath } from "@/lib/paths";
import { absoluteUrl } from "@/lib/site";

// DECISIONS 26 G: Surplus AI is now Surplus Station. A static export cannot send a 301, so the
// old address is a tiny page that refreshes to the new one (meta refresh, which works without
// JavaScript) and offers the link in case the refresh is blocked.

const TARGET = "/work/surplus-station";

export const metadata: Metadata = {
  title: "Surplus Station | Srujan Rudrapati",
  robots: { index: false, follow: true },
  description: "Surplus AI is now called Surplus Station.",
  alternates: { canonical: absoluteUrl(TARGET) },
};

export default function SurplusAiRedirect() {
  return (
    <main id="main" className="page wrap">
      {/* React 19 hoists this into <head>. */}
      <meta httpEquiv="refresh" content={`0; url=${withBasePath(TARGET)}`} />
      <h1 className="page-intro">
        Surplus AI is now called Surplus Station. <Link href={TARGET}>Go to Surplus Station</Link>.
      </h1>
    </main>
  );
}
