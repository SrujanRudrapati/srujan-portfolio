import { CertificateIcon, GraduationCapIcon } from "@phosphor-icons/react/dist/ssr";
import { certifications, education } from "@/content/portfolio";
import { Section } from "./ui";

export function Credentials() {
  return (
    <Section id="credentials" title="Certifications and education">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
        <section aria-labelledby="certs-heading" className="lg:col-span-6">
          <h3 id="certs-heading" className="mb-6 font-display text-lg font-semibold tracking-tight text-ink">
            Certifications
          </h3>
          <ul className="space-y-4">
            {certifications.map((cert) => (
              <li key={cert} className="flex gap-3 leading-snug text-ink">
                <CertificateIcon aria-hidden="true" size={20} className="mt-0.5 shrink-0 text-accent" />
                <span>{cert}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="edu-heading" className="lg:col-span-6">
          <h3 id="edu-heading" className="mb-6 font-display text-lg font-semibold tracking-tight text-ink">
            Education
          </h3>
          <ul className="space-y-6">
            {education.map((e) => (
              <li key={e.degree} className="flex gap-3">
                <GraduationCapIcon aria-hidden="true" size={20} className="mt-0.5 shrink-0 text-accent" />
                <div>
                  <p className="font-medium leading-snug text-ink">{e.degree}</p>
                  <p className="mt-1 text-muted">{e.school}</p>
                  <p className="mt-1 font-mono text-xs tabular-nums text-muted">
                    {e.dates} · {e.gpa}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Section>
  );
}
