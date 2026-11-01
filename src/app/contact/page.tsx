import type { Metadata } from "next";
import { Contact } from "@/components/Contact";
import { BackPill } from "@/components/shell/BackPill";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta("/contact", "Contact | Srujan Rudrapati", "Email, GitHub, LinkedIn and the resume.");

// Interim (W2): the v3 Contact block in the v4 page frame, so the home tile has a page.
// Phase W6 replaces it with the composer.
export default function ContactPage() {
  return (
    <main id="main" className="page">
      <div className="wrap">
        <BackPill />
        <h1 tabIndex={-1} className="page-title">
          Contact
        </h1>
        <Contact />
      </div>
    </main>
  );
}
