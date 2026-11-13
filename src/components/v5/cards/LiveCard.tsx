"use client";

import { useEffect, useRef, type ReactNode } from "react";
import s from "../cards.module.css";

type Props = { label: string; meta: string; className?: string; children: ReactNode };

/** A demo card. Its CSS animations run only while it is on screen ([data-live]). */
export function LiveCard({ label, meta, className, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) {
      el?.setAttribute("data-live", "");
      return;
    }
    const io = new IntersectionObserver(([entry]) => el.toggleAttribute("data-live", entry.isIntersecting), { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`${s.card} ${className ?? ""}`} data-card="">
      <div className={s.bar}>
        <span>{label}</span>
        <span>{meta}</span>
      </div>
      {children}
    </div>
  );
}
