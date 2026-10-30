"use client";

import { useEffect, useRef, type ElementType } from "react";
import { SplitText } from "gsap/SplitText";
import { EASE, ENTRANCE_S, FULL, gsap } from "./gsap";

gsap.registerPlugin(SplitText);

type Props = {
  as?: "h1" | "h2" | "h3" | "p";
  /** Plain text only: the server HTML carries the full sentence. */
  children: string;
  className?: string;
  id?: string;
  by?: "lines" | "words";
};

/**
 * A heading or line that rises line by line (or word by word) out of a mask as it scrolls in.
 * Screen readers read one visually hidden copy of the plain text; the visible copy that gets
 * split is aria-hidden. (SplitText's own aria "auto" puts aria-label on the element, which is
 * prohibited on a <p>.) Reduced motion: never split, final state.
 */
export function SplitReveal({ as = "h2", children, className, id, by = "lines" }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const Tag = as as ElementType;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(FULL, () => {
      const split = SplitText.create(el, {
        type: by === "lines" ? "lines" : "words,lines",
        mask: by,
        aria: "none",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(by === "lines" ? self.lines : self.words, {
            yPercent: 110,
            duration: ENTRANCE_S,
            ease: EASE,
            stagger: by === "lines" ? 0.08 : 0.03,
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          }),
      });
      return () => split.revert();
    });
    return () => mm.revert();
  }, [by, children]);

  return (
    <Tag id={id} className={className}>
      <span className="sr-only">{children}</span>
      <span ref={ref} aria-hidden="true" style={{ display: "block" }}>
        {children}
      </span>
    </Tag>
  );
}
