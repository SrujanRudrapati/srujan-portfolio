import { profile } from "@/content/profile";
import s from "./shell.module.css";

/** The v5 footer: name and a way back up. */
export function Footer() {
  return (
    <footer className={s.footer}>
      <span>{profile.name}</span>
      <a href="#main">Back to top</a>
    </footer>
  );
}
