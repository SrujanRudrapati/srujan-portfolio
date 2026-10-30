import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  as?: "div" | "article" | "li";
  /** Lift on hover. Turn off for cards that are not a single clickable unit. */
  lift?: boolean;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

// Surface with a heavy top rule. Depth comes from the rule and the surface tone;
// the only shadow on the site is the hover lift.
export function Card({ children, as: Tag = "div", lift = true, className = "", ...rest }: Props) {
  const motion = lift ? "transition-[transform,box-shadow] duration-200 ease-out-quart hover:-translate-y-0.5 hover:shadow-lift" : "";
  return (
    <Tag className={`border-t-[3px] border-ink bg-surface p-6 md:p-8 ${motion} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
