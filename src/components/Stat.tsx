type Props = {
  value: string;
  label: string;
  size?: "md" | "lg";
};

// One impact figure. Red is reserved for these and for the primary button, so a
// number in red always means "this is the result".
export function Stat({ value, label, size = "md" }: Props) {
  const scale = size === "lg" ? "text-4xl" : "text-3xl";
  return (
    <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span className={`font-display font-bold font-stretch-expanded leading-none tracking-tight tabular-nums text-accent ${scale}`}>
        {value}
      </span>
      <span className="text-sm text-muted">{label}</span>
    </p>
  );
}
