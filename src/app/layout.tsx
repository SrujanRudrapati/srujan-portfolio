import type { Metadata, Viewport } from "next";
import { Archivo, Martian_Mono } from "next/font/google";
import { AskPanel } from "@/components/ask/AskPanel";
import { MotionRoot } from "@/components/motion/MotionRoot";
import { CommandPalette } from "@/components/site/CommandPalette";
import { GameDialog } from "@/components/game/GameDialog";
import { Footer } from "@/components/site/Footer";
import { Nav } from "@/components/site/Nav";
import { projects } from "@/data/projects";
import "./globals.css";

// v3 type (design-direction): Archivo on its width axis for display and body, Martian Mono
// only for stage labels, figure numbers and keys.
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});
const martian = Martian_Mono({ subsets: ["latin"], variable: "--font-martian", display: "swap" });

// Runs synchronously while the HTML parses, before first paint. It marks the
// page as scripted (data-js: phone-only collapses key off it), then a stored choice
// sets data-theme so the matching token set applies immediately; no stored
// choice leaves the attribute off and the system preference decides.
const themeScript = `(function(){document.documentElement.setAttribute("data-js","");try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t)}}catch(e){}})();`;

const SITE_URL = "https://srujanrudrapati.github.io/srujan-portfolio/";
const TITLE = "Srujan Rudrapati | Data Engineer";
const DESCRIPTION = "Data engineer working across Databricks, Azure, and AWS. Lately building LLM systems that run on real data.";

export const metadata: Metadata = {
  // Absolute base for social cards: relative image paths resolve under the Pages project URL.
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  // Defaults for the home page; every other route sets its own canonical and card (src/lib/meta.ts).
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Srujan Rudrapati",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "og.png", width: 1200, height: 630, alt: "Srujan Rudrapati: I build the data layer, and the AI on top of it." }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["og.png"] },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${archivo.variable} ${martian.variable} antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">
        {/* Motion, transitions, the intro and the one shared 3D canvas persist across routes. */}
        <MotionRoot />
        <a href="#main" className="sr-only z-50 bg-accent px-4 py-2 font-medium text-on-accent focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
          Skip to content
        </a>
        <Nav />
        {children}
        <Footer />
        <CommandPalette projects={projects.map((p) => ({ slug: p.slug, title: p.title, oneLiner: p.oneLiner }))} />
        <AskPanel />
        <GameDialog />
      </body>
    </html>
  );
}
