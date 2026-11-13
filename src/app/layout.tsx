import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import { AskLoader } from "@/components/ask/AskLoader";
import { CommandPalette } from "@/components/site/CommandPalette";
import { GameDialog } from "@/components/game/GameDialog";
import { Footer } from "@/components/shell/Footer";
import { Header } from "@/components/shell/Header";
import { PageTransitions } from "@/components/shell/PageTransitions";
import { ShellEffects } from "@/components/shell/ShellEffects";
import { projects } from "@/data/projects";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

// v5 type (DESIGN.md): Archivo, variable in weight and width (the giant headings run at 125% width,
// weight 900), and IBM Plex Mono for labels. Both self-hosted by next/font.
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono", display: "swap" });

// Set before first paint so CSS can hide the scenes' strokes for the draw animation only when
// JavaScript will reveal them. Without JavaScript every drawing shows finished.
const JS_FLAG = "document.documentElement.setAttribute('data-js','')";

// Site-wide defaults. Every page sets its own title, description, canonical and card through pageMeta
// (src/lib/meta.ts); these only fill in what a page leaves out.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "Srujan Rudrapati",
  authors: [{ name: "Srujan Rudrapati", url: SITE_URL }],
  // Google Search Console ownership check (Srujan, 2026-11-13).
  verification: { google: "hAhqi_3xjSF438uIzD0fdHEzD0uV7QO7mh95xKFqY2A" },
};

export const viewport: Viewport = {
  themeColor: "#f4f0e8",
  colorScheme: "light",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: JS_FLAG }} />
      </head>
      <body>
        <a href="#main" className="sr-only z-[80] rounded-full bg-ink px-4 py-2 font-medium text-bg focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
          Skip to content
        </a>
        <Header />
        {children}
        <Footer />
        <PageTransitions />
        <ShellEffects />
        <CommandPalette projects={projects.map((p) => ({ slug: p.slug, title: p.title, oneLiner: p.oneLiner }))} />
        <AskLoader />
        <GameDialog />
      </body>
    </html>
  );
}
