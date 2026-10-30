"use client";

import { ListIcon, XIcon } from "@phosphor-icons/react";
import { profile } from "@/content/profile";
import { useActiveSection } from "@/hooks/use-active-section";
import { useMobileMenu } from "@/hooks/use-mobile-menu";
import { useScrolled } from "@/hooks/use-scrolled";
import { withBasePath } from "@/lib/paths";
import { AskButton } from "./ask/AskButton";
import { Button } from "./Button";
import { ThemeToggle } from "./ThemeToggle";
import { Container } from "./ui";

const navLinks = [
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
] as const;

const sectionIds = navLinks.map((link) => link.id);

export function SiteHeader() {
  const scrolled = useScrolled(20);
  const active = useActiveSection(sectionIds);
  const { open, setOpen, close, headerRef, buttonRef } = useMobileMenu();
  const raised = scrolled || open;

  return (
    <header
      ref={headerRef}
      data-scrolled={raised ? "" : undefined}
      className="sticky top-0 z-40 border-b-2 border-transparent bg-bg/80 backdrop-blur-md transition-[background-color,border-color] duration-200 data-scrolled:border-ink data-scrolled:bg-bg/95"
    >
      <Container className="flex h-16 items-center justify-between gap-4">
        <a href="#top" className="font-display text-base font-bold tracking-tight text-ink font-stretch-expanded">
          {profile.name}
        </a>

        <nav aria-label="Primary" className="flex items-center gap-3 md:gap-6">
          <ul className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  aria-current={active === link.id ? "location" : undefined}
                  className="text-sm font-medium text-muted underline-offset-[10px] decoration-2 decoration-accent-2 transition-colors duration-150 hover:text-ink aria-[current=location]:text-ink aria-[current=location]:underline"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <Button variant="secondary" size="sm" href={withBasePath(profile.resume)} external>
            Resume
          </Button>
          <span className="hidden md:inline-flex">
            <AskButton />
          </span>
          <span className="hidden md:inline-flex">
            <ThemeToggle />
          </span>
          <button
            type="button"
            ref={buttonRef}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen(!open)}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center border-2 border-ink text-ink transition-colors duration-150 hover:bg-ink hover:text-bg md:hidden"
          >
            {open ? <XIcon aria-hidden="true" size={18} weight="bold" /> : <ListIcon aria-hidden="true" size={18} weight="bold" />}
          </button>
        </nav>
      </Container>

      <div
        id="mobile-menu"
        hidden={!open}
        className="absolute inset-x-0 top-full h-[calc(100dvh-4rem)] overflow-y-auto border-t-2 border-ink bg-bg md:hidden"
      >
        <Container className="flex flex-col py-4">
          <ul className="flex flex-col" aria-label="Sections">
            {navLinks.map((link) => (
              <li key={link.id} className="border-b border-line">
                <a
                  href={`#${link.id}`}
                  onClick={close}
                  aria-current={active === link.id ? "location" : undefined}
                  className="flex min-h-14 items-center font-display text-2xl font-bold text-ink font-stretch-semi-expanded aria-[current=location]:text-accent-2"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <AskButton className="h-11" onOpen={close} />
          </div>
          <div className="mt-6 flex items-center justify-between gap-4 border-t border-line pt-6">
            <span className="text-sm font-medium text-ink">Color theme</span>
            <ThemeToggle />
          </div>
        </Container>
      </div>
    </header>
  );
}
