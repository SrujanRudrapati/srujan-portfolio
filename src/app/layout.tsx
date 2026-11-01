import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Hanken_Grotesk } from "next/font/google";
import { AskLoader } from "@/components/ask/AskLoader";
import { MotionRoot } from "@/components/motion/MotionRoot";
import { CommandPalette } from "@/components/site/CommandPalette";
import { GameDialog } from "@/components/game/GameDialog";
import { Footer } from "@/components/shell/Footer";
import { Header } from "@/components/shell/Header";
import { PageTransitions } from "@/components/shell/PageTransitions";
import { ShellEffects } from "@/components/shell/ShellEffects";
import { projects } from "@/data/projects";
import "./globals.css";

// v4 type (design-direction): Bodoni Moda for display (variable, optical size axis, roman and
// italic) and Hanken Grotesk for text, both self-hosted by next/font.
const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-bodoni",
  display: "swap",
});
const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap" });

// Runs before first paint: marks the page as scripted (phone-only collapses key off it).
const jsScript = `document.documentElement.setAttribute("data-js","")`;

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
  themeColor: "#0b0f14",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${bodoni.variable} ${hanken.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: jsScript }} />
      </head>
      <body>
        <a href="#main" className="sr-only z-[80] rounded-full bg-accent px-4 py-2 font-medium text-on-accent focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
          Skip to content
        </a>
        <Header />
        {children}
        <Footer />
        {/* Until W7: the v3 3D stage and its debug counters for pages not yet rebuilt. */}
        <MotionRoot />
        <PageTransitions />
        <ShellEffects />
        <CommandPalette projects={projects.map((p) => ({ slug: p.slug, title: p.title, oneLiner: p.oneLiner }))} />
        <AskLoader />
        <GameDialog />
      </body>
    </html>
  );
}
