import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "sm";

type Props = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  /** Renders an <a> when set; otherwise a <button>. */
  href?: string;
  download?: boolean;
  external?: boolean;
  type?: "button" | "submit";
  className?: string;
  "aria-label"?: string;
};

const base =
  "inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap transition-[background-color,color,border-color,transform] duration-150 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent-2";

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-base",
  sm: "h-9 px-3 text-sm",
};

const variants: Record<Variant, string> = {
  primary: "bg-accent text-on-accent hover:bg-accent-hover",
  secondary: "border-2 border-ink text-ink hover:bg-ink hover:text-bg",
  ghost: "px-1 text-accent-2 underline decoration-1 underline-offset-4 hover:text-accent-2-hover hover:decoration-2",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  download,
  external = false,
  type = "button",
  className = "",
  ...rest
}: Props) {
  const sizing = variant === "ghost" ? (size === "sm" ? "h-9 text-sm" : "h-11 text-base") : sizes[size];
  const classes = `${base} ${sizing} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <a
        href={href}
        download={download}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className={classes}
        {...rest}
      >
        {children}
      </a>
    );
  }
  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}
