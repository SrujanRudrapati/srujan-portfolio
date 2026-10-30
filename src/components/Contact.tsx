import { ArrowUpRightIcon, EnvelopeSimpleIcon, GithubLogoIcon, LinkedinLogoIcon } from "@phosphor-icons/react/dist/ssr";
import { profile } from "@/content/portfolio";
import { Container, TextLink } from "./ui";

export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-heading" className="border-t-2 border-ink">
      <Container className="py-section">
        <h2 id="contact-heading" className="text-3xl text-ink">
          Contact
        </h2>
        <p className="mt-4 text-lg text-muted">{profile.status}.</p>

        <a
          href={`mailto:${profile.email}`}
          className="mt-10 inline-flex max-w-full items-center gap-3 font-display text-2xl font-bold tracking-tight break-all text-ink transition-colors duration-150 font-stretch-expanded hover:text-accent-2 sm:text-3xl"
        >
          <EnvelopeSimpleIcon aria-hidden="true" className="hidden shrink-0 text-accent-2 sm:block" size={32} />
          {profile.email}
        </a>

        <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-2">
          <li>
            <TextLink href={profile.linkedin} external className="min-h-11">
              <LinkedinLogoIcon aria-hidden="true" size={20} />
              {profile.linkedinLabel}
              <ArrowUpRightIcon aria-hidden="true" size={14} weight="bold" />
            </TextLink>
          </li>
          <li>
            <TextLink href={profile.github} external className="min-h-11">
              <GithubLogoIcon aria-hidden="true" size={20} />
              {profile.githubLabel}
              <ArrowUpRightIcon aria-hidden="true" size={14} weight="bold" />
            </TextLink>
          </li>
        </ul>
      </Container>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-ink">
      <Container className="flex flex-col gap-2 py-8 text-sm text-muted sm:flex-row sm:justify-between">
        <p>© 2026 {profile.name}</p>
        <p>{profile.location}</p>
      </Container>
    </footer>
  );
}
