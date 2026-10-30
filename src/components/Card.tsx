import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  as?: "div" | "article" | "li";
  /** Lift on hover. Turn off for cards that are not a single clickable unit. */
  lift?: boolean;
  className?: string;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

// Surface with a heavy top rule. Depth comes from the rule and the surface tone;
// the only shadow on the site is the hover lift.
export function Card({ children, as: Tag = "div", lift = true, className = "", ...rest }: Props) {
  // Hover and keyboard focus inside the card look identical: 2px lift, top rule to cobalt, one shadow. No transform under reduced motion.
  const motion = lift
    ? "relative transition-[transform,border-color] duration-200 ease-out-quart before:pointer-events-none before:absolute before:inset-0 before:shadow-lift before:opacity-0 before:transition-opacity before:duration-200 before:content-[''] hover:border-accent-2 hover:before:opacity-100 motion-safe:hover:-translate-y-0.5 has-[a:focus-visible]:border-accent-2 has-[a:focus-visible]:before:opacity-100 motion-safe:has-[a:focus-visible]:-translate-y-0.5 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-3 has-[a:focus-visible]:outline-accent-2"
    : "";
  return (
    <Tag className={`border-t-[3px] border-ink bg-surface p-6 md:p-8 ${motion} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
