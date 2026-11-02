// The composer's mailto link (runbook v4 W6): the subject is fixed, the note becomes the body.

export const MAIL_SUBJECT = "Role for a data or AI engineer";

/** A mailto: URL to `email` with the fixed subject and, when the note is not blank, the note as the body. */
export function composeMailto(email: string, note: string): string {
  const params = [`subject=${encodeURIComponent(MAIL_SUBJECT)}`];
  if (note.trim()) params.push(`body=${encodeURIComponent(note)}`);
  return `mailto:${email}?${params.join("&")}`;
}
