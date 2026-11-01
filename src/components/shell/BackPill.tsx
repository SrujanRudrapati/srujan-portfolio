import Link from "next/link";

/** Rounded "Home" (or "All work") pill at the top of every inner page (runbook v4 W1.3). Magnetic. */
export function BackPill({ href = "/", label = "Home" }: { href?: string; label?: string }) {
  return (
    <Link href={href} className="back" data-magnetic>
      <svg viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.3" fill="none" aria-hidden="true">
        <path d="M13 7H1M6 2L1 7l5 5" />
      </svg>
      {label}
    </Link>
  );
}
