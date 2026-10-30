import type { ReactNode } from "react";

// The top of every v3 page: the pipeline stage it belongs to (mono, lowercase) and a
// condensed display h1. One h1 per page; PageTransitions focuses it on arrival.
export function PageHead({ stage, title, children }: { stage: string; title: string; children?: ReactNode }) {
  return (
    <header className="px-gutter pt-28 pb-12 md:pt-36">
      <div className="mx-auto max-w-page">
        <p className="font-mono text-[13px] text-muted">{stage}</p>
        <h1 className="mt-5 font-display text-[clamp(3.5rem,11vw,9rem)] leading-[0.86] font-extrabold tracking-[-0.03em] text-ink font-stretch-[62%]">{title}</h1>
        {children && <div className="mt-8 max-w-measure text-lg text-ink">{children}</div>}
      </div>
    </header>
  );
}
