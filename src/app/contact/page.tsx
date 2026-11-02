import type { Metadata } from "next";
import { ContactView } from "@/components/contact/ContactView";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta("/contact", "Contact | Srujan Rudrapati", "Email, a note composer, GitHub, LinkedIn and the resume.");

// Runbook v4 W6: Contact.
export default function ContactPage() {
  return <ContactView />;
}
