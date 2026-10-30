"use client";

import { EnvelopeSimpleIcon, FilePdfIcon, GithubLogoIcon, LinkedinLogoIcon, PrinterIcon } from "@phosphor-icons/react";
import type { RecruiterSheet } from "@/data/graph/lenses";
import { profile } from "@/content/profile";
import { withBasePath } from "@/lib/paths";

// One screen, one printed page: who, what, the three strongest figures, where
// now, top skills, the four featured projects as single lines, and contact.
// Print styles (globals.css, html[data-lens="recruiter"]) hide everything else.

export function RecruiterLens({ sheet }: { sheet: RecruiterSheet }) {
  return (
    <article id="recruiter-sheet" aria-label="Recruiter one-pager" className="border-t-[3px] border-ink bg-surface p-6 md:p-10 print:border-t-2 print:bg-transparent print:p-0">
      <header className="grid grid-cols-1 gap-6 border-b border-line pb-6 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="font-display text-3xl font-bold text-ink font-stretch-expanded">{profile.name}</p>
          <p className="mt-2 text-lg text-ink">{profile.headline}</p>
          <p className="mt-1 text-ink">{profile.subline}</p>
        </div>
        <div className="space-y-1 text-sm md:col-span-5">
          {sheet.currentRole && (
            <p className="text-ink">
              <span className="font-semibold">{sheet.currentRole.title}</span>, {sheet.currentRole.org}
              <span className="block text-muted tabular-nums">{sheet.currentRole.dates}</span>
            </p>
          )}
          <p className="text-ink">{profile.now}</p>
          <p className="text-muted">{profile.location}</p>
        </div>
      </header>

      <ul aria-label="Strongest results" className="grid grid-cols-1 gap-6 border-b border-line py-6 sm:grid-cols-3">
        {sheet.metrics.map((m) => (
          <li key={m.value + m.label}>
            <p className="font-display text-3xl leading-none font-bold tracking-tight text-accent tabular-nums font-stretch-expanded">{m.value}</p>
            <p className="mt-2 text-sm text-ink">{m.label}</p>
            <p className="mt-0.5 text-xs text-muted">{m.source}</p>
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-1 gap-8 py-6 md:grid-cols-12">
        <section aria-labelledby="recruiter-projects" className="md:col-span-7">
          <h4 id="recruiter-projects" className="mb-3 text-base text-ink">
            Featured projects
          </h4>
          <ul className="space-y-2">
            {sheet.featured.map((f) => (
              <li key={f.title} className="text-sm text-ink">
                <a href={f.href} className="font-semibold underline decoration-line decoration-1 underline-offset-4 hover:decoration-accent-2">
                  {f.title}
                </a>
                <span>: {f.line}</span>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="recruiter-skills" className="md:col-span-5">
          <h4 id="recruiter-skills" className="mb-3 text-base text-ink">
            Most-used skills
          </h4>
          <ul aria-label="Top skills" className="flex flex-wrap gap-1.5">
            {sheet.topSkills.map((s) => (
              <li key={s} className="border border-ink px-2 py-1 text-xs leading-none font-medium text-ink">
                {s}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <footer className="flex flex-col gap-4 border-t border-line pt-6 md:flex-row md:items-end md:justify-between">
        <ul aria-label="Contact" className="flex flex-col gap-2 text-sm">
          <li>
            <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-2 font-semibold text-ink underline decoration-1 underline-offset-4">
              <EnvelopeSimpleIcon aria-hidden="true" size={16} />
              {profile.email}
            </a>
          </li>
          <li className="flex flex-wrap gap-x-5 gap-y-2">
            <a href={profile.linkedin} className="inline-flex items-center gap-1.5 text-accent-2 underline decoration-1 underline-offset-4">
              <LinkedinLogoIcon aria-hidden="true" size={16} />
              {profile.linkedinLabel}
            </a>
            <a href={profile.github} className="inline-flex items-center gap-1.5 text-accent-2 underline decoration-1 underline-offset-4">
              <GithubLogoIcon aria-hidden="true" size={16} />
              {profile.githubLabel}
            </a>
            <a href={withBasePath(profile.resume)} className="inline-flex items-center gap-1.5 text-accent-2 underline decoration-1 underline-offset-4">
              <FilePdfIcon aria-hidden="true" size={16} />
              Resume (PDF)
            </a>
          </li>
        </ul>
        <div className="print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-11 items-center gap-2 border-2 border-ink px-4 text-sm font-medium text-ink transition-colors duration-150 hover:bg-ink hover:text-bg"
          >
            <PrinterIcon aria-hidden="true" size={18} />
            Print or save as PDF
          </button>
          <p className="mt-2 text-xs text-muted">Opens the print dialog. Choose Save as PDF to download a one-page copy.</p>
        </div>
      </footer>
    </article>
  );
}
