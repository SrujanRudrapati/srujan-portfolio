import { profile } from "@/content/profile";
import { contact } from "@/data/home";
import { withBasePath } from "@/lib/paths";
import { AskButton } from "../AskButton";
import { Pin } from "../Pin";
import s from "../sections.module.css";

const NEW_TAB = <span className="sr-only"> (opens in a new tab)</span>;

/** Let's talk, where the thread ends in the kolam. */
export function Contact() {
  return (
    <section className={`${s.section} ${s.contact}`} id="contact" data-theme="night" data-reveal="" aria-labelledby="contact-heading">
      <Pin left="12%" top="8%" />
      <Pin kolam top="50%" left="50%" />
      <p className={`${s.q} ${s.mono} ${s.z}`}>{contact.line}</p>
      <h2 id="contact-heading" className={`${s.talk} ${s.wide} ${s.z}`}>
        <a href={`mailto:${profile.email}`}>{contact.heading}</a>
      </h2>
      <div className={`${s.links} ${s.mono} ${s.z}`}>
        <a href={`mailto:${profile.email}`}>Email</a>
        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
          LinkedIn{NEW_TAB}
        </a>
        <a href={profile.github} target="_blank" rel="noopener noreferrer">
          GitHub{NEW_TAB}
        </a>
        <a href={withBasePath(profile.resume)} target="_blank" rel="noopener noreferrer">
          Résumé PDF{NEW_TAB}
        </a>
        <AskButton />
      </div>
    </section>
  );
}
