import { useEffect, useState } from "react";

// A section is "active" when it crosses a band 30% to 40% down the viewport.
// At the very bottom of the page the last section wins, since a short final
// section may never reach the band.
const BAND = "-30% 0px -60% 0px";

export function useActiveSection(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const sections = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const inBand = new Map<string, boolean>();
    const update = () => {
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) {
        setActive(ids[ids.length - 1]);
        return;
      }
      setActive(ids.find((id) => inBand.get(id)) ?? null);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) inBand.set(entry.target.id, entry.isIntersecting);
        update();
      },
      { rootMargin: BAND },
    );
    sections.forEach((section) => observer.observe(section));
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update);
    };
  }, [ids]);

  return active;
}
