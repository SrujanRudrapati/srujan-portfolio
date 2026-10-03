import {
  EnvelopeSimpleIcon,
  FileArrowDownIcon,
  GithubLogoIcon,
  LinkedinLogoIcon,
} from "@phosphor-icons/react/dist/ssr";
import { profile } from "@/content/portfolio";
import { HeroDiagram } from "./HeroDiagram";
import { Container } from "./ui";

const navLinks = [
  { href: "#work", label: "Work" },
  { href: "#experience", label: "Experience" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-6">
        <a href="#top" className="font-display text-base font-semibold tracking-tight text-ink">
          {profile.name}
        </a>
        <nav aria-label="Primary" className="flex items-center gap-6">
          <ul className="hidden items-center gap-6 md:flex">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="text-[15px] text-muted transition-colors duration-150 hover:text-ink">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href={profile.resume}
            download
            className="inline-flex h-9 items-center rounded-md border border-line px-3 text-sm font-medium text-ink transition-colors duration-150 hover:border-accent hover:text-accent"
          >
            Resume
          </a>
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
          <h1
            id="hero-heading"
            className="font-display text-4xl leading-[1.05] font-semibold tracking-tight text-ink sm:text-5xl lg:text-6xl"
          >
            {profile.headline}
          </h1>
          <p className="mt-6 max-w-[48ch] text-lg leading-relaxed text-muted md:text-xl">{profile.subline}</p>

          <ul className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
            <li>
              <a
                href={profile.resume}
                download
                className="inline-flex h-11 items-center gap-2 rounded-md bg-accent px-5 font-medium text-on-accent transition-[background-color,transform] duration-150 hover:bg-accent-hover active:scale-[0.98]"
              >
                <FileArrowDownIcon aria-hidden="true" size={18} weight="bold" />
                Download Resume
              </a>
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
        className="inline-flex min-h-11 items-center gap-2 font-medium text-ink transition-colors duration-150 hover:text-accent"
      >
        {children}
        {label}
      </a>
    </li>
  );
}
