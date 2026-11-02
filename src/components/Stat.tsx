type Props = {
  value: string;
  label: string;
  /** Label on its own line under the figure, for rows of several figures. */
  stacked?: boolean;
};

// One impact figure, in the v4 figure style (design-direction): Bodoni in the metal gradient,
// as on the result tiles, so a large bronze number always means "this is the result".
export function Stat({ value, label, stacked = false }: Props) {
  return (
    <p className={stacked ? "flex flex-col gap-y-1.5" : "flex flex-wrap items-baseline gap-x-3 gap-y-1"}>
      <span className="metal [font-family:var(--serif)] text-4xl leading-[1] font-normal tracking-[-0.02em] print:text-black">
        {value}
      </span>
      <span className="text-sm text-muted">{label}</span>
    </p>
  );
}
