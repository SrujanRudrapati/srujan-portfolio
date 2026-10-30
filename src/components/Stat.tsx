type Props = {
  value: string;
  label: string;
  /** Label on its own line under the figure, for rows of several figures. */
  stacked?: boolean;
};

// One impact figure. Red is reserved for these and for the primary button, so a
// number in red always means "this is the result".
export function Stat({ value, label, stacked = false }: Props) {
  return (
    <p className={stacked ? "flex flex-col gap-y-1.5" : "flex flex-wrap items-baseline gap-x-3 gap-y-1"}>
      <span className={`font-display font-bold font-stretch-expanded leading-none tracking-tight tabular-nums text-accent text-3xl`}>
        {value}
      </span>
      <span className="text-sm text-muted">{label}</span>
    </p>
  );
}
