"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { AskButton } from "@/components/v5/AskButton";
import s from "./shell.module.css";

const HIDE_AFTER_PX = 140;
const MOVE_PX = 12;

/**
 * The v5 nav (design/redesign.html ".nav"): initials, Projects, About, Contact, and Ask. It slides
 * away while scrolling down past 140px and returns on any scroll up. Section links point at the
 * home page's anchors, so they work from every page.
 */
export function Header() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let last = scrollY;
    const onScroll = () => {
      const y = scrollY;
      if (Math.abs(y - last) <= MOVE_PX) return;
      // Never hide while something inside the nav has keyboard focus.
      el.toggleAttribute("data-up", y > last && y > HIDE_AFTER_PX && !el.contains(document.activeElement));
      last = y;
    };
    const onFocus = () => el.removeAttribute("data-up");
    addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("focusin", onFocus);
    return () => {
      removeEventListener("scroll", onScroll);
      el.removeEventListener("focusin", onFocus);
    };
  }, []);
  return (
    <header ref={ref} className={s.header}>
      <Link href="/" className={s.me} aria-label="Srujan Rudrapati, home">
        SR
      </Link>
      <nav aria-label="Primary" className={s.nav}>
        <Link href="/#work">Projects</Link>
        <Link href="/#about" className={s.hideSmall}>
          About
        </Link>
        <Link href="/#contact">Contact</Link>
        <AskButton className={s.ask} label="Ask" />
      </nav>
    </header>
  );
}
