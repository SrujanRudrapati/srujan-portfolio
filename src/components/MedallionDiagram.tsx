// Hero visual. Source systems feed bronze, silver and gold layers; gold feeds a
// serving layer; LLMs and agents sit on top. Two dots travel the connectors on
// a loop and each stage lights briefly as a dot arrives. All motion is CSS
// (offset-path on the dots, keyframed opacity on lit overlays over the stages; see .medallion-* in
// globals.css). Under prefers-reduced-motion, or where offset-path is not
// supported, the dots are hidden and every stage renders lit and still.

type Stage = { id: string; x: number; y: number; w: number; h: number; label: string; sub?: string; accent?: boolean };

const stages: Stage[] = [
  { id: "llm", x: 20, y: 36, w: 400, h: 72, label: "LLMs and agents", sub: "RAG, Claude API, MLX", accent: true },
  { id: "serving", x: 20, y: 168, w: 400, h: 44, label: "Serving layer" },
  { id: "bronze", x: 20, y: 268, w: 112, h: 56, label: "Bronze", sub: "raw" },
  { id: "silver", x: 164, y: 268, w: 112, h: 56, label: "Silver", sub: "cleaned" },
  { id: "gold", x: 308, y: 268, w: 112, h: 56, label: "Gold", sub: "modeled" },
  { id: "source", x: 20, y: 380, w: 400, h: 44, label: "Source systems" },
];

// Connectors: [path, arrowhead tip x, tip y, direction]. The dots' offset-path
// in globals.css runs through the box centres and overlaps every one of these.
const connectors: [string, number, number, "up" | "right"][] = [
  ["M76 380 V324", 76, 324, "up"],
  ["M132 296 H164", 164, 296, "right"],
  ["M276 296 H308", 308, 296, "right"],
  ["M364 268 V212", 364, 212, "up"],
  ["M220 168 V108", 220, 108, "up"],
];

const arrowhead = (x: number, y: number, dir: "up" | "right") =>
  dir === "up" ? `M${x - 5} ${y + 7} L${x} ${y} L${x + 5} ${y + 7}` : `M${x - 7} ${y - 5} L${x} ${y} L${x - 7} ${y + 5}`;

export function MedallionDiagram() {
  return (
    <svg
      viewBox="0 0 440 440"
      role="img"
      aria-labelledby="hero-diagram-title hero-diagram-desc"
      className="medallion h-auto w-full"
    >
      <title id="hero-diagram-title">Data pipeline from source systems up to LLMs and agents</title>
      <desc id="hero-diagram-desc">
        Source systems feed a medallion architecture: bronze for raw data, silver for cleaned data, and gold for
        modeled data. Gold feeds a serving layer, and LLMs and agents run on top of it.
      </desc>

      <text x="20" y="254" fontSize="11" fontWeight={500} fill="var(--muted)" className="medallion-text">
        Medallion architecture
      </text>

      <g fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {connectors.map(([d, x, y, dir]) => (
          <g key={d}>
            <path d={d} />
            <path d={arrowhead(x, y, dir)} />
          </g>
        ))}
      </g>

      {/* Dots are drawn before the stages so they pass beneath each box. */}
      <g aria-hidden="true">
        <circle className="medallion-dot" r="4.5" fill="var(--accent)" />
        <circle className="medallion-dot medallion-dot-2" r="4.5" fill="var(--accent)" />
      </g>

      {stages.map((s) => (
        <g key={s.id} className="medallion-stage" data-stage={s.id} data-sub={s.sub ? "" : undefined}>
          <rect className="medallion-base" x={s.x} y={s.y} width={s.w} height={s.h} rx={10} />
          {/* Lit overlay: opacity is the only animated property; fully on when nothing animates. */}
          <rect className="medallion-lit" x={s.x} y={s.y} width={s.w} height={s.h} rx={10} />
          <rect
            x={s.x}
            y={s.y}
            width={s.w}
            height={s.h}
            rx={10}
            fill="none"
            stroke={s.accent ? "var(--accent)" : "rgba(232, 234, 237, 0.4)"}
            strokeWidth={s.accent ? 1.5 : 1}
          />
          <text
            x={s.x + s.w / 2}
            y={s.y + (s.sub ? s.h / 2 - 3 : s.h / 2 + 5)}
            textAnchor="middle"
            fontSize={s.accent ? 17 : 14}
            fontWeight={500}
            fill="var(--text)"
            className="medallion-label"
          >
            {s.label}
          </text>
          {s.sub && (
            <text
              x={s.x + s.w / 2}
              y={s.y + s.h / 2 + 15}
              textAnchor="middle"
              fontSize="11"
              fill="var(--muted)"
              className="medallion-text"
            >
              {s.sub}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
