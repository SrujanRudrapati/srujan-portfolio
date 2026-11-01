type Props = {
  value: string;
  label: string;
  /** Label on its own line under the figure, for rows of several figures. */
  stacked?: boolean;
};

// One impact figure, in the v3 figure style (design-direction): Archivo condensed 800 in the
// accent, so a large blue number always means "this is the result".
export function Stat({ value, label, stacked = false }: Props) {
  return (
    <p className={stacked ? "flex flex-col gap-y-1.5" : "flex flex-wrap items-baseline gap-x-3 gap-y-1"}>
      <span className={`font-display font-extrabold font-stretch-[62%] leading-[0.9] tracking-[-0.02em] tabular-nums text-accent text-4xl`}>
        {value}
      </span>
      <span className="text-sm text-muted">{label}</span>
    </p>
  );
}
