import { ArrowUpIcon, EnvelopeSimpleIcon, FilePdfIcon, GithubLogoIcon, LinkedinLogoIcon } from "@phosphor-icons/react/dist/ssr";
import { profile } from "@/content/profile";
import { withBasePath } from "@/lib/paths";
import { Container } from "./ui";

const iconLink =
  "inline-flex min-h-11 items-center gap-2 border-2 border-ink px-4 text-sm font-medium text-ink transition-colors duration-150 hover:bg-ink hover:text-bg";

export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-heading" className="border-t-2 border-ink">
      <Container className="py-section">
        <h2 id="contact-heading" className="text-3xl text-ink">
          Contact
        </h2>
        <p className="mt-4 max-w-measure text-lg text-ink">{profile.status}.</p>

        <a
          href={`mailto:${profile.email}`}
          className="mt-8 inline-flex max-w-full items-center gap-3 font-display text-xl font-bold tracking-tight break-all text-ink transition-colors duration-150 font-stretch-expanded hover:text-accent-2 sm:text-3xl lg:text-4xl"
        >
          <EnvelopeSimpleIcon aria-hidden="true" className="hidden shrink-0 text-accent-2 sm:block" size={36} />
          {profile.email}
        </a>

        <ul aria-label="Profiles and resume" className="mt-8 flex flex-wrap gap-3">
          <li>
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile, opens in a new tab" className={iconLink}>
              <LinkedinLogoIcon aria-hidden="true" size={20} />
              LinkedIn
            </a>
          </li>
          <li>
            <a href={profile.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub profile, opens in a new tab" className={iconLink}>
              <GithubLogoIcon aria-hidden="true" size={20} />
              GitHub
            </a>
          </li>
          <li>
            <a href={withBasePath(profile.resume)} target="_blank" rel="noopener noreferrer" aria-label="Resume PDF, opens in a new tab" className={iconLink}>
              <FilePdfIcon aria-hidden="true" size={20} />
              Resume
            </a>
          </li>
        </ul>
      </Container>
    </section>
  );
}

// The build year: a static export bakes it in at build time, which is when the page last changed.
const year = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-ink">
      <Container className="flex flex-col gap-4 py-8 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-ink">
            © {year} {profile.name}
          </p>
          <p>{profile.location}</p>
          <p>Built with Next.js, deployed on GitHub Pages.</p>
        </div>
        <a href="#top" className="inline-flex min-h-11 items-center gap-2 font-medium text-accent-2 underline decoration-1 underline-offset-4 hover:text-accent-2-hover">
          <ArrowUpIcon aria-hidden="true" size={16} weight="bold" />
          Back to top
        </a>
      </Container>
    </footer>
  );
}
