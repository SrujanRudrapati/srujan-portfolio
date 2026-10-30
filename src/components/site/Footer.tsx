import { profile } from "@/content/profile";
import { withBasePath } from "@/lib/paths";

// On every page: the end of the pipeline. How to reach Srujan and the resume, one click each.
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t-2 border-ink px-gutter print:hidden">
      <div className="mx-auto grid max-w-page grid-cols-1 gap-8 py-12 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="font-mono text-[13px] text-muted">stage 04 / query</p>
          <p className="mt-4 font-display text-[clamp(1.25rem,5.2vw,1.875rem)] font-bold [overflow-wrap:anywhere] text-ink">
            <a href={`mailto:${profile.email}`} className="-my-[11px] inline-block py-[11px] underline decoration-accent-2 decoration-2 underline-offset-[6px] hover:text-accent-2">
              {profile.email}
            </a>
          </p>
        </div>
        <ul aria-label="Elsewhere" className="flex flex-col gap-1 md:col-span-5 md:items-end">
          {[
            { href: profile.github, label: "GitHub" },
            { href: profile.linkedin, label: "LinkedIn" },
            { href: withBasePath(profile.resume), label: "Resume (PDF)", newTab: true },
          ].map((l) => (
            <li key={l.label}>
              <a href={l.href} {...("newTab" in l ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="inline-flex min-h-11 items-center text-ink underline decoration-1 underline-offset-4 hover:text-accent-2">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted md:col-span-12">
          © {year} {profile.name}, {profile.location}. Built with Next.js, deployed on GitHub Pages.
        </p>
      </div>
    </footer>
  );
}
