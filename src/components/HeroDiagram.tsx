import type { CSSProperties } from "react";

// Draws once on load with CSS (see .draw-line / .draw-appear in globals.css).
// No client JS. Under prefers-reduced-motion it renders finished.

type Box = { x: number; y: number; w: number; h: number; label: string; sub?: string; accent?: boolean; d: number };

const boxes: Box[] = [
  { x: 20, y: 380, w: 400, h: 44, label: "Source systems", d: 0 },
  { x: 20, y: 268, w: 112, h: 56, label: "Bronze", sub: "raw", d: 360 },
  { x: 164, y: 268, w: 112, h: 56, label: "Silver", sub: "cleaned", d: 600 },
  { x: 308, y: 268, w: 112, h: 56, label: "Gold", sub: "modeled", d: 840 },
  { x: 20, y: 168, w: 400, h: 44, label: "Serving layer", d: 1080 },
  { x: 20, y: 36, w: 400, h: 72, label: "LLMs and agents", sub: "RAG, Claude API, MLX", accent: true, d: 1320 },
];

// [path, delay, arrowhead tip x, tip y, direction]
const lines: [string, number, number, number, "up" | "right"][] = [
  ["M76 380 V324", 160, 76, 324, "up"],
  ["M132 296 H164", 420, 164, 296, "right"],
  ["M276 296 H308", 660, 308, 296, "right"],
  ["M364 268 V212", 900, 364, 212, "up"],
  ["M220 168 V108", 1140, 220, 108, "up"],
];

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

export function HeroDiagram() {
  return (
    <svg
      viewBox="0 0 440 440"
      role="img"
      aria-labelledby="hero-diagram-title hero-diagram-desc"
      className="h-auto w-full max-w-[480px]"
    >
      <title id="hero-diagram-title">Data pipeline from source systems up to LLMs and agents</title>
      <desc id="hero-diagram-desc">
        Source systems feed a medallion architecture: bronze for raw data, silver for cleaned data, and gold for
        modeled data. Gold feeds a serving layer, and LLMs and agents run on top of it.
      </desc>

      <text x="20" y="254" className="draw-appear" style={{ ...delay(300), fontFamily: "var(--font-plex-mono)" }} fontSize="11" fill="var(--muted)">
        Medallion architecture
      </text>

      {lines.map(([d, ms, x, y, dir]) => (
        <g key={d}>
          <path d={d} pathLength={1} className="draw-line" style={delay(ms)} fill="none" stroke="var(--accent)" strokeWidth="1.5" />
          <path
            d={dir === "up" ? `M${x - 5} ${y + 7} L${x} ${y} L${x + 5} ${y + 7}` : `M${x - 7} ${y - 5} L${x} ${y} L${x - 7} ${y + 5}`}
            className="draw-appear"
            style={delay(ms + 300)}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ))}

      {boxes.map((b) => (
        <g key={b.label} className="draw-appear" style={delay(b.d)}>
          <rect
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            rx="6"
            fill="var(--raised)"
            stroke={b.accent ? "var(--accent)" : "var(--border)"}
            strokeWidth={b.accent ? 1.5 : 1}
          />
          <text
            x={b.x + b.w / 2}
            y={b.y + (b.sub ? b.h / 2 - 3 : b.h / 2 + 5)}
            textAnchor="middle"
            fontSize={b.accent ? 17 : 14}
            fontWeight={500}
            fill="var(--text)"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {b.label}
          </text>
          {b.sub && (
            <text
              x={b.x + b.w / 2}
              y={b.y + b.h / 2 + 15}
              textAnchor="middle"
              fontSize="11"
              fill="var(--muted)"
              style={{ fontFamily: "var(--font-plex-mono)" }}
            >
              {b.sub}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
