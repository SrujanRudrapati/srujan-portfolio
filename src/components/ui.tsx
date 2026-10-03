import type { ReactNode } from "react";

// Shape rule: controls and tags use rounded-md (6px); containers use rounded-xl (12px).

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-10 ${className}`}>{children}</div>;
}

export function Section({
  id,
  title,
  intro,
  children,
}: {
  id: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="border-t border-line">
      <Container className="py-20 md:py-28">
        <header className="mb-12 max-w-[65ch] md:mb-16">
          <h2
            id={`${id}-heading`}
            className="font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl"
          >
            {title}
          </h2>
          {intro && <p className="mt-4 text-lg leading-relaxed text-muted">{intro}</p>}
        </header>
        {children}
      </Container>
    </section>
  );
}

export function TagList({ items, label }: { items: string[]; label: string }) {
  return (
    <ul aria-label={label} className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          translate="no"
          className="rounded-md bg-tag px-2 py-1 font-mono text-[12.5px] leading-none text-tag-ink"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

export function TextLink({
  href,
  children,
  external = false,
  className = "",
  ...rest
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
  className?: string;
  "aria-label"?: string;
  download?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`inline-flex items-center gap-1.5 font-medium text-accent underline decoration-line decoration-1 underline-offset-4 transition-colors duration-150 hover:text-accent-hover hover:decoration-accent-hover ${className}`}
      {...rest}
    >
      {children}
    </a>
  );
}
