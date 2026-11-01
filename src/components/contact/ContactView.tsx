import { AskEntry } from "@/components/home/AskEntry";
import { BackPill } from "@/components/shell/BackPill";
import { profile } from "@/content/profile";
import { withBasePath } from "@/lib/paths";
import { Composer } from "./Composer";
import s from "./contact.module.css";

// Contact (runbook v4 W6): the email in large Bodoni (an underline draws on hover), the composer,
// the profile links and the resume, and the Ask entry. Everything comes from `profile`.

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

export function ContactView() {
  const [local, domain] = profile.email.split("@");
  return (
    <main id="main" className="page">
      <div className="wrap">
        <BackPill />
        <h1 tabIndex={-1} className="page-title">
          Contact
        </h1>
        <p className="page-intro">Hiring for data or AI engineering? {profile.status}.</p>
        <a className={s.mail} href={`mailto:${profile.email}`}>
          {/* If the address must wrap, it wraps after the @, never inside a word. */}
          {local}@<wbr />
          {domain}
        </a>
        <Composer email={profile.email} />
        <ul className={s.links} aria-label="Profiles and resume">
          <li>
            <a href={profile.github} {...external}>
              GitHub<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
          <li>
            <a href={profile.linkedin} {...external}>
              LinkedIn<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
          <li>
            <a href={withBasePath(profile.resume)} {...external}>
              Resume (PDF)<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        </ul>
        <p className={s.ask}>
          Questions first? <AskEntry className={s.askButton} />
        </p>
      </div>
    </main>
  );
}
