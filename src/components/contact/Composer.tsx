"use client";

import { useEffect, useRef, useState } from "react";
import { composeMailto } from "./mailto";
import s from "./contact.module.css";

const COPIED_MS = 1800;

/**
 * "Write a note" (runbook v4 W6): the note goes into a mailto: link with a fixed subject, opened in the
 * visitor's own email app. Nothing is sent from the site. "Copy email" copies the address and says so.
 */
export function Composer({ email }: { email: string }) {
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(email);
      setCopied("done");
    } catch {
      setCopied("failed");
    }
    timer.current = setTimeout(() => setCopied("idle"), COPIED_MS);
  };

  return (
    <div className={s.compose}>
      <label htmlFor="contact-note" className={s.label}>
        Write a note
      </label>
      <textarea id="contact-note" className={s.note} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Hi Srujan, we’re hiring for…" rows={4} />
      <div className={s.row}>
        <button type="button" className="btn" onClick={copy} data-magnetic>
          {copied === "done" ? "Email copied" : copied === "failed" ? "Copy failed, select the address above" : "Copy email"}
        </button>
        <a className="btn btn-solid" href={composeMailto(email, note)} data-magnetic>
          Open in my email app
        </a>
      </div>
      <p className={s.status} role="status">
        {copied === "done" ? "Email address copied." : ""}
      </p>
    </div>
  );
}
