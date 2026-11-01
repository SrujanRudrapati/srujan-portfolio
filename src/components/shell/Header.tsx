"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { profile } from "@/content/profile";
import s from "./shell.module.css";

const SOLID_AFTER_PX = 30;

/** Fixed 60px header: the name (home) and the availability line, nothing else (runbook v4 W1.2).
 *  Transparent at the top, frosted after 30px of scroll. */
export function Header() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => el.toggleAttribute("data-solid", scrollY > SOLID_AFTER_PX);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header ref={ref} className={s.header}>
      <div className={`wrap ${s.bar}`}>
        <Link href="/" className={s.mark}>
          {profile.name}
        </Link>
        <span className={s.avail}>{profile.availability}</span>
      </div>
    </header>
  );
}
