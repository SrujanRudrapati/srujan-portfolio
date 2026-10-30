import {
  EnvelopeSimpleIcon,
  FileArrowDownIcon,
  GithubLogoIcon,
  LinkedinLogoIcon,
} from "@phosphor-icons/react/dist/ssr";
import { profile } from "@/content/portfolio";
import { Button } from "./Button";
import { HeroDiagram } from "./HeroDiagram";
import { ThemeToggle } from "./ThemeToggle";
import { Container } from "./ui";

const navLinks = [
  { href: "#work", label: "Work" },
  { href: "#experience", label: "Experience" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-bg/90 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-6">
        <a href="#top" className="font-display text-base font-bold font-stretch-expanded tracking-tight text-ink">
          {profile.name}
        </a>
        <nav aria-label="Primary" className="flex items-center gap-3 md:gap-6">
          <ul className="hidden items-center gap-6 md:flex">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="text-sm font-medium text-muted transition-colors duration-150 hover:text-ink">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <Button variant="secondary" size="sm" href={profile.resume} download>
            Resume
          </Button>
          <ThemeToggle />
        </nav>
      </Container>
    </header>
  );
}

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-heading">
      <Container className="grid grid-cols-1 gap-12 pt-16 pb-20 md:pt-24 md:pb-28 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-7">
          <h1 id="hero-heading" className="text-4xl text-ink">
            {profile.headline}
          </h1>
          <p className="mt-6 max-w-[44ch] text-xl text-ink">{profile.subline}</p>

          <ul className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
            <li>
              <Button href={profile.resume} download>
                <FileArrowDownIcon aria-hidden="true" size={18} weight="bold" />
                Download Resume
              </Button>
            </li>
            <HeroLink href={profile.github} label="GitHub" external>
              <GithubLogoIcon aria-hidden="true" size={20} />
            </HeroLink>
            <HeroLink href={profile.linkedin} label="LinkedIn" external>
              <LinkedinLogoIcon aria-hidden="true" size={20} />
            </HeroLink>
            <HeroLink href={`mailto:${profile.email}`} label="Email">
              <EnvelopeSimpleIcon aria-hidden="true" size={20} />
            </HeroLink>
          </ul>
        </div>

        <div className="flex justify-center lg:col-span-5 lg:justify-end">
          <HeroDiagram />
        </div>
      </Container>
    </section>
  );
}

function HeroLink({
  href,
  label,
  external = false,
  children,
}: {
  href: string;
  label: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  return (
    <li>
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="inline-flex min-h-11 items-center gap-2 font-medium text-ink transition-colors duration-150 hover:text-accent-2"
      >
        {children}
        {label}
      </a>
    </li>
  );
}
