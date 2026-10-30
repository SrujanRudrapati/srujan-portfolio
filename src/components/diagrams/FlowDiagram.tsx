"use client";

import { useId, type CSSProperties } from "react";
import { useInView } from "@/hooks/use-in-view";

// One engine for every project diagram. A diagram is a set of boxes, the
// connectors drawn between them, and "tracks": ordered lists of boxes a dot
// travels through. Each box lights (an opacity-animated overlay) the moment a
// dot reaches it, so stages light in order. Timing is computed from the path
// length, so the data drives the motion and nothing is hand-measured.
//
// Motion rules (design-direction skill): dots and lighting run only while the
// figure is on screen and the tab is visible (useInView), only under
// prefers-reduced-motion: no-preference, and only where offset-path is
// supported. The default, with no JavaScript or reduced motion, is every box
// lit and still, which reads fully on its own. Styles: .flow-* in globals.css.

export type FlowNode = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  /** Small muted line above the label, e.g. "Agent 2". */
  kicker?: string;
  /** Muted line(s) under the label. Pass an array to break lines by hand. */
  sub?: string | string[];
  variant?: "solid" | "accent" | "ghost";
  /** Box fill. Nested layers alternate so each ring stays visible. */
  fill?: "bg" | "surface";
  /** Where a track passes through the box. Layers use "top" so the dot crosses their edge. */
  anchor?: "center" | "top";
  /** Left-aligned text, for wide layer boxes. */
  align?: "start" | "middle";
};

export type FlowEdge = { from: string; to: string; dashed?: boolean; arrow?: boolean };

export type FlowTrack = {
  nodes: string[];
  /** Dots sharing this path, spread evenly over the loop. */
  dots?: number;
  /** Delay in seconds, so parallel tracks alternate. */
  offset?: number;
};

export type FlowNote = { x: number; y: number; text: string };

export type FlowLayout = {
  width: number;
  height: number;
  nodes: FlowNode[];
  edges: FlowEdge[];
  tracks: FlowTrack[];
  notes?: FlowNote[];
  /** Font sizes for the label and the kicker/sub lines. Narrow layouts use larger type. */
  type?: { label: number; small: number };
};

type Props = {
  title: string;
  desc: string;
  caption: string;
  wide: FlowLayout;
  narrow: FlowLayout;
  /** Seconds for one full loop of a track. */
  loopSeconds?: number;
  className?: string;
};

type Point = { x: number; y: number };

const centre = (n: FlowNode): Point => ({ x: n.x + n.w / 2, y: n.y + n.h / 2 });
const anchorOf = (n: FlowNode): Point => (n.anchor === "top" ? { x: n.x + n.w / 2, y: n.y + 12 } : centre(n));
const inside = (p: Point, n: FlowNode) => p.x >= n.x && p.x <= n.x + n.w && p.y >= n.y && p.y <= n.y + n.h;

/** Orthogonal route from p to q. The elbow corner is the one that sits inside either box, so the dot rides along a bar instead of cutting across empty space. */
function route(p: Point, q: Point, a: FlowNode, b: FlowNode): Point[] {
  if (p.x === q.x || p.y === q.y) return [q];
  const vh = { x: p.x, y: q.y };
  const hv = { x: q.x, y: p.y };
  if (inside(vh, a) || inside(vh, b)) return [vh, q];
  if (inside(hv, a) || inside(hv, b)) return [hv, q];
  return [vh, q];
}

const manhattan = (p: Point, q: Point) => Math.abs(p.x - q.x) + Math.abs(p.y - q.y);

type TrackGeometry = { d: string; arrivals: Map<string, number> };

function trackGeometry(track: FlowTrack, byId: Map<string, FlowNode>): TrackGeometry {
  const nodes = track.nodes.map((id) => {
    const node = byId.get(id);
    if (!node) throw new Error(`FlowDiagram: track references unknown node "${id}"`);
    return node;
  });
  const first = nodes[0];
  let point = anchorOf(first);
  let d = `M${point.x} ${point.y}`;
  let length = 0;
  const distances = new Map<string, number>([[first.id, 0]]);

  nodes.slice(1).forEach((node, i) => {
    const target = anchorOf(node);
    for (const step of route(point, target, nodes[i], node)) {
      d += ` L${step.x} ${step.y}`;
      length += manhattan(point, step);
      point = step;
    }
    if (!distances.has(node.id)) distances.set(node.id, length);
  });

  const arrivals = new Map<string, number>();
  distances.forEach((at, id) => arrivals.set(id, length === 0 ? 0 : at / length));
  return { d, arrivals };
}

type Dir = "up" | "down" | "left" | "right";

function edgeGeometry(a: FlowNode, b: FlowNode): { d: string; tip: Point; dir: Dir } {
  const xOverlap = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const yOverlap = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  if (xOverlap > 0) {
    const x = Math.max(a.x, b.x) + xOverlap / 2;
    if (b.y >= a.y + a.h) return { d: `M${x} ${a.y + a.h} V${b.y}`, tip: { x, y: b.y }, dir: "down" };
    return { d: `M${x} ${a.y} V${b.y + b.h}`, tip: { x, y: b.y + b.h }, dir: "up" };
  }
  if (yOverlap > 0) {
    const y = Math.max(a.y, b.y) + yOverlap / 2;
    if (b.x >= a.x + a.w) return { d: `M${a.x + a.w} ${y} H${b.x}`, tip: { x: b.x, y }, dir: "right" };
    return { d: `M${a.x} ${y} H${b.x + b.w}`, tip: { x: b.x + b.w, y }, dir: "left" };
  }
  // Elbow: leave a vertically, arrive at b from the side.
  const ca = centre(a);
  const cb = centre(b);
  const startY = cb.y > ca.y ? a.y + a.h : a.y;
  const endX = cb.x > ca.x ? b.x : b.x + b.w;
  return { d: `M${ca.x} ${startY} V${cb.y} H${endX}`, tip: { x: endX, y: cb.y }, dir: cb.x > ca.x ? "right" : "left" };
}

function arrowhead({ x, y }: Point, dir: Dir): string {
  switch (dir) {
    case "up":
      return `M${x - 5} ${y + 7} L${x} ${y} L${x + 5} ${y + 7}`;
    case "down":
      return `M${x - 5} ${y - 7} L${x} ${y} L${x + 5} ${y - 7}`;
    case "left":
      return `M${x + 7} ${y - 5} L${x} ${y} L${x + 7} ${y + 5}`;
    case "right":
      return `M${x - 7} ${y - 5} L${x} ${y} L${x - 7} ${y + 5}`;
  }
}

type Lit = { arrive: number; period: number };

function lighting(layout: FlowLayout, byId: Map<string, FlowNode>, loopSeconds: number) {
  const lit = new Map<string, Lit>();
  const paths: { d: string; dots: number; offset: number }[] = [];
  for (const track of layout.tracks) {
    const dots = Math.max(1, track.dots ?? 1);
    const offset = track.offset ?? 0;
    const { d, arrivals } = trackGeometry(track, byId);
    paths.push({ d, dots, offset });
    const period = loopSeconds / dots;
    arrivals.forEach((fraction, id) => {
      if (lit.has(id)) return;
      // A node sees `dots` arrivals per loop, so its flash period is loop/dots.
      // The dot's negative delay shifts every arrival earlier by the same amount.
      const phase = fraction * dots + offset / period;
      lit.set(id, { arrive: ((phase % 1) + 1) % 1, period });
    });
  }
  return { lit, paths };
}

function TextBlock({ node, type }: { node: FlowNode; type: { label: number; small: number } }) {
  const subLines = node.sub === undefined ? [] : Array.isArray(node.sub) ? node.sub : [node.sub];
  const muted = "var(--text-muted)";
  const ink = node.variant === "ghost" ? muted : "var(--text)";
  const lines = [
    ...(node.kicker ? [{ text: node.kicker, size: type.small, weight: 500, fill: muted }] : []),
    { text: node.label, size: type.label, weight: 700, fill: ink },
    ...subLines.map((text) => ({ text, size: type.small, weight: 400, fill: muted })),
  ];
  const gap = 3;
  const total = lines.reduce((sum, line) => sum + line.size, 0) + gap * (lines.length - 1);
  const top = node.align === "start" ? node.y + 12 : centre(node).y - total / 2;
  const x = node.align === "start" ? node.x + 14 : centre(node).x;
  let baseline = top;
  return (
    <>
      {lines.map((line, i) => {
        baseline += line.size + (i === 0 ? 0 : gap);
        return (
          <text
            key={`${node.id}-${i}`}
            x={x}
            y={baseline - line.size * 0.15}
            textAnchor={node.align === "start" ? "start" : "middle"}
            fontSize={line.size}
            fontWeight={line.weight}
            fill={line.fill}
            className={line.weight === 700 ? "flow-text flow-label" : "flow-text"}
          >
            {line.text}
          </text>
        );
      })}
    </>
  );
}

function Layout({
  layout,
  loopSeconds,
  titleId,
  descId,
  title,
  desc,
  className,
}: {
  layout: FlowLayout;
  loopSeconds: number;
  titleId: string;
  descId: string;
  title: string;
  desc: string;
  className: string;
}) {
  const byId = new Map(layout.nodes.map((n) => [n.id, n]));
  const { lit, paths } = lighting(layout, byId, loopSeconds);
  const type = layout.type ?? { label: 14, small: 11 };

  return (
    <svg
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      role="img"
      aria-labelledby={`${titleId} ${descId}`}
      className={`flow-svg h-auto w-full ${className}`}
      style={{ "--loop": `${loopSeconds}s` } as CSSProperties}
    >
      <title id={titleId}>{title}</title>
      <desc id={descId}>{desc}</desc>

      <g fill="none" stroke="var(--accent-2)" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
        {layout.edges.map((edge) => {
          const a = byId.get(edge.from);
          const b = byId.get(edge.to);
          if (!a || !b) throw new Error(`FlowDiagram: edge references unknown node "${edge.from}" or "${edge.to}"`);
          const { d, tip, dir } = edgeGeometry(a, b);
          return (
            <g key={`${edge.from}-${edge.to}`} strokeDasharray={edge.dashed ? "4 4" : undefined}>
              <path d={d} />
              {edge.arrow !== false && <path d={arrowhead(tip, dir)} strokeDasharray="none" />}
            </g>
          );
        })}
      </g>

      {/* Dots are drawn before the boxes so they pass beneath each one. */}
      <g aria-hidden="true">
        {paths.map((path, i) =>
          Array.from({ length: path.dots }, (_, k) => (
            <circle
              key={`${i}-${k}`}
              className="flow-dot"
              r="4.5"
              fill="var(--accent-2)"
              style={{
                offsetPath: `path("${path.d}")`,
                animationDelay: `${path.offset - (k * loopSeconds) / path.dots}s`,
              }}
            />
          )),
        )}
      </g>

      {layout.nodes.map((node) => {
        const glow = lit.get(node.id);
        const stroke = node.variant === "accent" ? "var(--accent-2)" : node.variant === "ghost" ? "var(--text-muted)" : "var(--text)";
        return (
          <g key={node.id} className="flow-node" data-variant={node.variant ?? "solid"}>
            <rect
              x={node.x}
              y={node.y}
              width={node.w}
              height={node.h}
              fill={node.fill === "surface" ? "var(--surface)" : "var(--bg)"}
              stroke={stroke}
              strokeWidth={node.variant === "accent" ? 2 : 1}
              strokeDasharray={node.variant === "ghost" ? "4 3" : undefined}
            />
            {glow && (
              <rect
                className="flow-lit"
                x={node.x}
                y={node.y}
                width={node.w}
                height={node.h}
                fill="var(--flow-lit)"
                style={{ "--arrive": glow.arrive, "--period": `${glow.period}s` } as CSSProperties}
              />
            )}
            <TextBlock node={node} type={type} />
          </g>
        );
      })}

      {layout.notes?.map((note) => (
        <text key={`${note.x}-${note.y}`} x={note.x} y={note.y} fontSize={type.small} fontWeight={500} fill="var(--text-muted)" className="flow-text">
          {note.text}
        </text>
      ))}
    </svg>
  );
}

export function FlowDiagram({ title, desc, caption, wide, narrow, loopSeconds = 6, className = "" }: Props) {
  const uid = useId();
  const { ref, active } = useInView<HTMLElement>("0px 0px -10% 0px");
  return (
    <figure
      ref={ref}
      data-animate={active ? "on" : undefined}
      className={`flow border-t-[3px] border-ink bg-surface p-5 md:p-8 ${className}`}
    >
      {/* Two layouts, one per breakpoint. The hidden one is display:none, so it has no animation cost and screen readers skip it. */}
      <Layout layout={wide} loopSeconds={loopSeconds} titleId={`${uid}-wt`} descId={`${uid}-wd`} title={title} desc={desc} className="hidden md:block" />
      <Layout layout={narrow} loopSeconds={loopSeconds} titleId={`${uid}-nt`} descId={`${uid}-nd`} title={title} desc={desc} className="md:hidden" />
      <figcaption className="mt-5 max-w-measure text-sm text-muted">{caption}</figcaption>
    </figure>
  );
}
