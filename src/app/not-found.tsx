import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Page not found | Srujan Rudrapati" };

// 404 in the Pipeline's language: the query ran, no row came back. V6 adds the
// "Clean the pipeline" game here.
export default function NotFound() {
  return (
    <main id="main" className="px-gutter pt-28 pb-section md:pt-36">
      <div className="mx-auto max-w-page">
        <p className="font-mono text-[13px] text-muted">stage 04 / query</p>
        <h1 className="mt-5 font-display text-[clamp(3.5rem,11vw,9rem)] leading-[0.86] text-ink">Row not found</h1>
        <pre className="mt-10 max-w-full overflow-x-auto border-l-2 border-accent-2 bg-surface p-5 font-mono text-sm text-ink">
          <code>{`select * from pages\nwhere path = current_path;\n\n0 rows returned.`}</code>
        </pre>
        <p className="mt-8 max-w-measure text-lg text-ink">This page does not exist. These do:</p>
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          {[
            { href: "/", label: "Home" },
            { href: "/work", label: "Work" },
            { href: "/explore", label: "Explore" },
            { href: "/about", label: "About" },
            { href: "/cv", label: "CV" },
          ].map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="inline-flex min-h-11 items-center font-medium text-ink underline decoration-accent-2 decoration-1 underline-offset-4 hover:text-accent-2">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
