"use client";

import type { ReactNode } from "react";
import { useInView } from "@/hooks/use-in-view";

/** Sets data-animate="on" while the child is on screen and the tab is visible, so CSS loops (the hero medallion) pause otherwise. */
export function AnimateInView({ children, className = "" }: { children: ReactNode; className?: string }) {
  const { ref, active } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} data-animate={active ? "on" : undefined} className={className}>
      {children}
    </div>
  );
}
