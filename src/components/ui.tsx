import type { ReactNode } from "react";

// Layout primitives. Card, Button, Stat, Reveal and ThemeToggle live in their own files.
// Shape rule: square corners everywhere; the focus ring is the only rounded thing.

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-page px-gutter ${className}`}>{children}</div>;
}

export function Section({
  id,
  title,
  intro,
  children,
}: {
  id: string;
  title: ReactNode;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="border-t-2 border-ink">
      <Container className="py-section">
        <header className="mb-10 max-w-measure md:mb-14">
          <h2 id={`${id}-heading`} className="text-3xl text-ink">
            {title}
          </h2>
          {intro && <p className="mt-4 text-lg text-muted">{intro}</p>}
        </header>
        {children}
      </Container>
    </section>
  );
}

export function TagList({
  items,
  label,
  size = "sm",
  tone = "ink",
}: {
  items: string[];
  label: string;
  size?: "sm" | "md";
  /** "ink" is an outlined tag; "quiet" is a filled surface with a hairline, for rows that sit next to buttons. */
  tone?: "ink" | "quiet";
}) {
  const chip = size === "md" ? "px-3 py-2 text-sm leading-none" : "px-2 py-1 text-xs leading-none";
  const look = tone === "quiet" ? "border border-line bg-surface" : "border border-ink";
  return (
    <ul aria-label={label} className={`flex flex-wrap ${size === "md" ? "gap-2" : "gap-1.5"}`}>
      {items.map((item) => (
        <li key={item} translate="no" className={`${look} font-medium text-ink ${chip}`}>
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
      className={`inline-flex items-center gap-1.5 font-medium text-accent-2 underline decoration-1 underline-offset-4 transition-colors duration-150 hover:text-accent-2-hover hover:decoration-2 ${className}`}
      {...rest}
    >
      {children}
    </a>
  );
}
