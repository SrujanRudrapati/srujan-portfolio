import { useEffect, useRef, useState } from "react";

/**
 * True while the element is on screen and the tab is visible. Diagram loops
 * key their animation on it so nothing animates offscreen or in a background
 * tab. Without IntersectionObserver the value stays false, which leaves the
 * diagram in its static, fully lit state.
 */
export function useInView<T extends HTMLElement>(rootMargin = "0px") {
  const ref = useRef<T>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || !("IntersectionObserver" in window)) return;

    let intersecting = false;
    const update = () => setActive(intersecting && !document.hidden);

    const observer = new IntersectionObserver(
      ([entry]) => {
        intersecting = entry?.isIntersecting ?? false;
        update();
      },
      { rootMargin },
    );
    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [rootMargin]);

  return { ref, active };
}
