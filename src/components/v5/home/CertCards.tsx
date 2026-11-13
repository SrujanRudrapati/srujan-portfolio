import { existsSync } from "node:fs";
import { join } from "node:path";
import { BADGE_DIR, BADGE_EXTENSIONS, certificationCards, type CertificationCard } from "@/data/certifications";
import { withBasePath } from "@/lib/paths";
import s from "./certs.module.css";

const BADGE_PX = 88;

/** The badge file for a card, found at build time in public/badges/, or null until it is added. */
function badgeSrc(card: CertificationCard): string | null {
  for (const ext of BADGE_EXTENSIONS) {
    const file = `${BADGE_DIR}/${card.badge}${ext}`;
    if (existsSync(join(process.cwd(), "public", file))) return withBasePath(file);
  }
  return null;
}

/** Certified: one card per certification, with its official badge (unaltered), full name and issuer. */
export function CertCards() {
  return (
    <ul className={s.grid} aria-label="Certifications">
      {certificationCards().map((card) => {
        const src = badgeSrc(card);
        return (
          <li key={card.id} className={s.card}>
            {src ? (
              // Official badge as supplied: object-fit contain, so it is scaled, never cropped or recoloured.
              // eslint-disable-next-line @next/next/no-img-element -- static export, images.unoptimized
              <img className={s.badge} src={src} alt={card.name} width={BADGE_PX} height={BADGE_PX} loading="lazy" decoding="async" />
            ) : (
              <span className={s.missing} data-badge-missing={card.badge}>
                Badge to come
              </span>
            )}
            <p className={s.name}>{card.name}</p>
            <p className={s.issuer}>{card.issuer}</p>
            {card.verifyUrl && (
              <a className={s.verify} href={card.verifyUrl} target="_blank" rel="noopener noreferrer">
                Verify<span className="sr-only"> {card.name} (opens in a new tab)</span>
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}
