import type { Metadata } from "next";

// Phase V1 concept prototypes. Throwaway: removed in Phase V7 (pre-approved).
export const metadata: Metadata = {
  title: "Lab | Srujan Rudrapati",
  robots: { index: false, follow: false },
};

export default function LabLayout({ children }: LayoutProps<"/lab">) {
  return children;
}
