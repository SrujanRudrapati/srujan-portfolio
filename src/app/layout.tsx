import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

// One family. The width axis gives headlines their expanded cut and body its normal cut.
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

// Runs synchronously while the HTML parses, before first paint. A stored choice
// sets data-theme so the matching token set applies immediately; no stored
// choice leaves the attribute off and the system preference decides.
const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t)}}catch(e){}})();`;

const SITE_URL = "https://srujanrudrapati.github.io/srujan-portfolio/";
const TITLE = "Srujan Rudrapati | Data Engineer";
const DESCRIPTION = "Data engineer working across Databricks, Azure, and AWS. Lately building LLM systems that run on real data.";

export const metadata: Metadata = {
  // Absolute base for social cards: relative image paths resolve under the Pages project URL.
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
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
    { media: "(prefers-color-scheme: dark)", color: "#161616" },
    { media: "(prefers-color-scheme: light)", color: "#f6f6f3" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${archivo.variable} antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
