import { ArrowUpRightIcon, EnvelopeSimpleIcon, LinkedinLogoIcon } from "@phosphor-icons/react/dist/ssr";
import { profile } from "@/content/portfolio";
import { Container } from "./ui";

export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-heading" className="border-t border-line">
      <Container className="py-20 md:py-28">
        <h2 id="contact-heading" className="font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          Contact
        </h2>
        <p className="mt-4 text-lg text-muted">{profile.status}.</p>

        <a
          href={`mailto:${profile.email}`}
          className="group mt-10 inline-flex max-w-full items-center gap-3 font-display text-2xl font-medium tracking-tight break-all text-ink transition-colors duration-150 hover:text-accent sm:text-3xl md:text-4xl"
        >
          <EnvelopeSimpleIcon aria-hidden="true" className="hidden shrink-0 text-accent sm:block" size={32} />
          {profile.email}
        </a>

        <p className="mt-6">
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 font-medium text-accent underline decoration-line underline-offset-4 transition-colors duration-150 hover:text-accent-hover hover:decoration-accent-hover"
          >
            <LinkedinLogoIcon aria-hidden="true" size={20} />
            {profile.linkedinLabel}
            <ArrowUpRightIcon aria-hidden="true" size={14} weight="bold" />
          </a>
        </p>
      </Container>
    </section>
);
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <Container className="flex flex-col gap-2 py-8 text-sm text-muted sm:flex-row sm:justify-between">
        <p>© 2026 {profile.name}</p>
        <p>{profile.location}</p>
      </Container>
    </footer>
  );
}
