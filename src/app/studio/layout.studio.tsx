import type { Metadata } from "next";
import type { ReactNode } from "react";

// The poster studio's segment (V7). Files here end in .studio.tsx, which Next treats as routes
// only when POSTER_STUDIO=1 adds that extension (next.config.ts), so the published export never
// contains /studio. Used by `npm run posters` against `POSTER_STUDIO=1 npm run dev`.
export const metadata: Metadata = {
  title: "Poster studio | Srujan Rudrapati",
  robots: { index: false, follow: false },
};

export default function StudioLayout({ children }: { children: ReactNode }) {
  return children;
}
