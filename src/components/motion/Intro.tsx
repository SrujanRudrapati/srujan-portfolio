"use client";

import { useEffect, useRef } from "react";
import { gsap } from "./gsap";
import s from "./motion.module.css";

// The first-visit intro (motion-system): at most 1.2 s, once per session, skippable by any
// key, click, touch or wheel, never under reduced motion. The overlay is in the HTML but
// hidden unless the pre-paint script below marks <html data-intro>, so crawlers and no-JS
// visitors never see it, and a CSS timeout hides it even if this component never runs.
// The script also wires the skip, so a key pressed before hydration already ends it.

export const INTRO_SCRIPT = `try{if(!sessionStorage.getItem("intro")&&matchMedia("(prefers-reduced-motion: no-preference)").matches){var d=document.documentElement;d.setAttribute("data-intro","");sessionStorage.setItem("intro","1");var k=function(){d.removeAttribute("data-intro")};["keydown","pointerdown","wheel","touchstart"].forEach(function(t){addEventListener(t,k,{once:true,capture:true})})}}catch(e){}`;

export function Intro() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = document.documentElement;
    const el = ref.current;
    if (!el || !root.hasAttribute("data-intro")) return;
    const q = gsap.utils.selector(el);
    const finish = () => {
      tl.kill();
      root.removeAttribute("data-intro");
    };
    const tl = gsap
      .timeline({ onComplete: finish })
      .from(q("[data-intro-line]"), { scaleX: 0, transformOrigin: "left center", duration: 0.6, ease: "power3.inOut" })
      .from(q("[data-intro-label]"), { opacity: 0, y: 8, duration: 0.3, ease: "power3.out" }, 0.1)
      .to(el, { clipPath: "inset(0 0 100% 0)", duration: 0.45, ease: "power3.inOut" }, 0.7);
    const skip = () => finish();
    const opts = { once: true, capture: true } as const;
    for (const type of ["keydown", "pointerdown", "wheel", "touchstart"]) addEventListener(type, skip, opts);
    return () => {
      // Kill only: React's development double mount must not end the intro before it plays.
      for (const type of ["keydown", "pointerdown", "wheel", "touchstart"]) removeEventListener(type, skip, opts);
      tl.kill();
    };
  }, []);
  return (
    <div ref={ref} className={s.intro} aria-hidden>
      <p className={s.introLabel} data-intro-label>
        stage 01 / ingest
      </p>
      <span className={s.introLine} data-intro-line />
    </div>
  );
}
