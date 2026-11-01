import { profile } from "@/content/profile";
import { Clock } from "./Clock";
import s from "./shell.module.css";

/** Name and year, and the live time in Arizona (runbook v4 W1.4). */
export function Footer() {
  return (
    <div className="wrap">
      <footer className={s.footer}>
        <span>
          {profile.name}, {new Date().getFullYear()}
        </span>
        <Clock />
      </footer>
    </div>
  );
}
