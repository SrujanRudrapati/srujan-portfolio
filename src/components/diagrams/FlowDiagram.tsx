"use client";

import { useId, useRef, type CSSProperties } from "react";
import { useDrawOnEnter } from "@/hooks/use-draw-on-enter";

// One engine for every project diagram. A diagram is a set of boxes, the
// connectors drawn between them, and "tracks": ordered lists of boxes a dot
// travels through. Each box gets a lit overlay (opacity animated) per dot
// arrival, phased from the path length, so stages light in order and the data
// drives the timing; nothing is hand-measured.
//
// Motion (runbook v4 W4, motion-system): the figure draws once when it scrolls into view.
// Connectors draw in bronze, each box lights when the data first reaches it, and one dot
// per track rides through once. CSS transitions keyed on data-draw (globals.css); timings
// come from the tracks' path lengths. The server markup is the finished drawing, which is
// also what reduced motion and no JavaScript show.
//
// Sizing: SVG text scales with the container, so each diagram ships a wide
// layout (1024px and up) and a narrow one sized to the ~280px slot a phone
// gives it. Rendered text never drops below 12px at the breakpoints we serve.

export type FlowNode = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Bold line(s). Pass an array to break a long label by hand. */
  label: string | string[];
  /** Small muted line above the label, e.g. "Agent 2". */
  kicker?: string;
  /** Muted line(s) under the label. */
  sub?: string | string[];
  variant?: "solid" | "accent" | "ghost";
  /** Box fill. Nested layers alternate so each ring stays visible. */
  fill?: "bg" | "surface";
  /** Where a track passes through the box. Layers use "top" so the dot crosses their edge. */
  anchor?: "center" | "top";
  /** Left-aligned text, for wide layer boxes. */
  align?: "start" | "middle";
  /** Rotate the label 90 degrees counter-clockwise, for a tall bar. Only the label is drawn. */
  vertical?: boolean;
};

export type FlowEdge = { from: string; to: string; dashed?: boolean; arrow?: boolean };

export type FlowTrack = {
  nodes: string[];
  /** Kept for the layouts' data; the drawing uses one dot per track. */
  dots?: number;
  /** Delay in seconds (negative = already under way), so parallel tracks alternate. */
  offset?: number;
};

export type FlowNote = { x: number; y: number; text: string };

export type FlowType = { label: number; small: number };

export type FlowLayout = {
  width: number;
  height: number;
  nodes: FlowNode[];
  edges: FlowEdge[];
  tracks: FlowTrack[];
  notes?: FlowNote[];
  type?: FlowType;
};

type Props = {
  title: string;
  desc: string;
  caption: string;
  wide: FlowLayout;
  narrow: FlowLayout;
  className?: string;
};

type Point = { x: number; y: number };
type Dir = "up" | "down" | "left" | "right";
type NodeMap = Map<string, FlowNode>;

/** Shortest connector draw on the 0 to 1 scrub clock. */
const MIN_DRAW = 0.02;
const DEFAULT_TYPE: FlowType = { label: 15, small: 13 };
const LINE_GAP = 3;

const centre = (n: FlowNode): Point => ({ x: n.x + n.w / 2, y: n.y + n.h / 2 });
const anchorOf = (n: FlowNode): Point => (n.anchor === "top" ? { x: n.x + n.w / 2, y: n.y + 12 } : centre(n));
const inside = (p: Point, n: FlowNode) => p.x >= n.x && p.x <= n.x + n.w && p.y >= n.y && p.y <= n.y + n.h;
const manhattan = (p: Point, q: Point) => Math.abs(p.x - q.x) + Math.abs(p.y - q.y);
const lines = (value: string | string[] | undefined): string[] => (value === undefined ? [] : Array.isArray(value) ? value : [value]);

function nodeById(byId: NodeMap, id: string): FlowNode {
  const node = byId.get(id);
  if (!node) throw new Error(`FlowDiagram: unknown node "${id}"`);
  return node;
}

/** Orthogonal route from p to q. The elbow corner is the one that sits inside either box, so the dot rides along a bar instead of cutting across empty space. */
function route(p: Point, q: Point, a: FlowNode, b: FlowNode): Point[] {
  if (p.x === q.x || p.y === q.y) return [q];
  const vh = { x: p.x, y: q.y };
  const hv = { x: q.x, y: p.y };
  if (inside(vh, a) || inside(vh, b)) return [vh, q];
  if (inside(hv, a) || inside(hv, b)) return [hv, q];
  return [vh, q];
}

/** Path through the track's anchors, plus every arrival as a fraction of the path length. */
function trackGeometry(track: FlowTrack, byId: NodeMap): { d: string; arrivals: { id: string; at: number }[] } {
  const nodes = track.nodes.map((id) => nodeById(byId, id));
  let point = anchorOf(nodes[0]);
  let d = `M${point.x} ${point.y}`;
  let length = 0;
  const distances = [{ id: nodes[0].id, at: 0 }];
  nodes.slice(1).forEach((node, i) => {
    for (const step of route(point, anchorOf(node), nodes[i], node)) {
      d += ` L${step.x} ${step.y}`;
      length += manhattan(point, step);
      point = step;
    }
    distances.push({ id: node.id, at: length });
  });
  return { d, arrivals: distances.map(({ id, at }) => ({ id, at: length === 0 ? 0 : at / length })) };
}

/** Boxes some track passes through: each gets a lit overlay, shown once the data reaches it. */
function litNodes(layout: FlowLayout): Set<string> {
  return new Set(layout.tracks.flatMap((t) => t.nodes));
}

/** Draw timing on a 0 to 1 clock, from the same path lengths the loop uses: when each box is first reached,
 *  and when each connector starts and how long it takes to draw. */
function drawTimings(layout: FlowLayout, byId: NodeMap) {
  const nodeAt = new Map<string, number>();
  const edgeAt = new Map<string, { start: number; dur: number }>();
  for (const track of layout.tracks) {
    const { arrivals } = trackGeometry(track, byId);
    arrivals.forEach(({ id, at }, k) => {
      nodeAt.set(id, Math.min(nodeAt.get(id) ?? 1, at));
      const prev = arrivals[k - 1];
      if (!prev) return;
      const t = { start: prev.at, dur: Math.max(MIN_DRAW, at - prev.at) };
      for (const key of [`${prev.id}-${id}`, `${id}-${prev.id}`]) if (!edgeAt.has(key)) edgeAt.set(key, t);
    });
  }
  // An edge no track walks draws between the moments its two ends are first reached.
  for (const e of layout.edges) {
    const key = `${e.from}-${e.to}`;
    if (edgeAt.has(key)) continue;
    const [a, b] = [nodeAt.get(e.from) ?? 0, nodeAt.get(e.to) ?? 0].sort((x, y) => x - y);
    edgeAt.set(key, { start: a, dur: Math.max(MIN_DRAW, b - a) });
  }
  return { nodeAt, edgeAt };
}

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

function Edges({ layout, byId, edgeAt }: { layout: FlowLayout; byId: NodeMap; edgeAt?: Map<string, { start: number; dur: number }> }) {
  return (
    <g fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {layout.edges.map((edge) => {
        const { d, tip, dir } = edgeGeometry(nodeById(byId, edge.from), nodeById(byId, edge.to));
        const t = edgeAt?.get(`${edge.from}-${edge.to}`) ?? { start: 0, dur: 0.1 };
        return (
          <g
            key={`${edge.from}-${edge.to}`}
            strokeDasharray={edge.dashed ? "4 4" : undefined}
            data-edge={edgeAt ? (edge.dashed ? "fade" : "draw") : undefined}
            style={edgeAt ? ({ "--start": t.start, "--dur": t.dur } as CSSProperties) : undefined}
          >
            <path d={d} pathLength={edgeAt && !edge.dashed ? 1 : undefined} strokeLinecap={edgeAt && !edge.dashed ? "butt" : undefined} />
            {edge.arrow !== false && <path d={arrowhead(tip, dir)} strokeDasharray="none" />}
          </g>
        );
      })}
    </g>
  );
}

function NodeText({ node, type }: { node: FlowNode; type: FlowType }) {
  const muted = "var(--muted)";
  const ink = node.variant === "ghost" ? muted : "var(--text)";
  const c = centre(node);
  if (node.vertical) {
    return (
      <text x={c.x} y={c.y + type.label * 0.35} textAnchor="middle" fontSize={type.label} fontWeight={500} fill={ink} className="flow-text" transform={`rotate(-90 ${c.x} ${c.y})`}>
        {lines(node.label).join(" ")}
      </text>
    );
  }
  const rows = [
    ...(node.kicker ? [{ text: node.kicker, size: type.small, weight: 400, fill: muted }] : []),
    ...lines(node.label).map((text) => ({ text, size: type.label, weight: 500, fill: ink })),
    ...lines(node.sub).map((text) => ({ text, size: type.small, weight: 400, fill: muted })),
  ];
  const total = rows.reduce((sum, row) => sum + row.size, 0) + LINE_GAP * (rows.length - 1);
  const start = node.align === "start" ? { x: node.x + 14, y: node.y + 12 } : { x: c.x, y: c.y - total / 2 };
  let baseline = start.y;
  return (
    <>
      {rows.map((row, i) => {
        baseline += row.size + (i === 0 ? 0 : LINE_GAP);
        return (
          <text
            key={`${node.id}-${i}`}
            x={start.x}
            y={baseline - row.size * 0.15}
            textAnchor={node.align === "start" ? "start" : "middle"}
            fontSize={row.size}
            fontWeight={row.weight}
            fill={row.fill}
            className="flow-text"
          >
            {row.text}
          </text>
        );
      })}
    </>
  );
}

function DrawDots({ layout, byId }: { layout: FlowLayout; byId: NodeMap }) {
  return (
    <g aria-hidden="true">
      {layout.tracks.map((track, i) => (
        <circle key={i} className="flow-dot" data-draw-dot="" r="4.5" fill="var(--accent)" style={{ offsetPath: `path("${trackGeometry(track, byId).d}")`, offsetRotate: "0deg" }} />
      ))}
    </g>
  );
}

function Nodes({ layout, lit, type, nodeAt }: { layout: FlowLayout; lit: Set<string>; type: FlowType; nodeAt: Map<string, number> }) {
  return (
    <>
      {layout.nodes.map((node) => {
        const stroke = node.variant === "accent" ? "var(--accent)" : node.variant === "ghost" ? "var(--muted)" : "var(--flow-box)";
        const box = { x: node.x, y: node.y, width: node.w, height: node.h };
        return (
          <g key={node.id} className="flow-node" data-at={nodeAt.get(node.id) ?? 0} style={{ "--at": nodeAt.get(node.id) ?? 0 } as CSSProperties}>
            <rect {...box} rx={10} fill={node.fill === "surface" ? "var(--surface)" : "var(--bg)"} stroke={stroke} strokeWidth={node.variant === "accent" ? 1.5 : 1} strokeDasharray={node.variant === "ghost" ? "4 3" : undefined} />
            {lit.has(node.id) && <rect className="flow-lit" {...box} rx={10} fill="var(--flow-lit)" />}
            <NodeText node={node} type={type} />
          </g>
        );
      })}
    </>
  );
}

function Layout({ layout, ids, title, desc, className }: { layout: FlowLayout; ids: [string, string]; title: string; desc: string; className: string }) {
  const byId: NodeMap = new Map(layout.nodes.map((n) => [n.id, n]));
  const lit = litNodes(layout);
  const timing = drawTimings(layout, byId);
  const type = layout.type ?? DEFAULT_TYPE;
  return (
    <svg viewBox={`0 0 ${layout.width} ${layout.height}`} role="img" aria-labelledby={ids.join(" ")} className={`flow-svg ${className}`}>
      <title id={ids[0]}>{title}</title>
      <desc id={ids[1]}>{desc}</desc>
      <Edges layout={layout} byId={byId} edgeAt={timing.edgeAt} />
      <DrawDots layout={layout} byId={byId} />
      <Nodes layout={layout} lit={lit} type={type} nodeAt={timing.nodeAt} />
      {layout.notes?.map((note) => (
        <text key={`${note.x}-${note.y}`} x={note.x} y={note.y} fontSize={type.small} fontWeight={400} fill="var(--muted)" className="flow-text">
          {note.text}
        </text>
      ))}
    </svg>
  );
}

export function FlowDiagram({ title, desc, caption, wide, narrow, className = "" }: Props) {
  const uid = useId();
  const ref = useRef<HTMLElement>(null);
  useDrawOnEnter(ref, true);
  return (
    <figure ref={ref} className={`flow flow-panel ${className}`}>
      {/* One layout per breakpoint. The hidden one is display:none, so it has no animation cost and screen readers skip it. */}
      <Layout layout={wide} ids={[`${uid}-wt`, `${uid}-wd`]} title={title} desc={desc} className="flow-wide" />
      <Layout layout={narrow} ids={[`${uid}-nt`, `${uid}-nd`]} title={title} desc={desc} className="flow-narrow" />
      <figcaption className="flow-caption">{caption}</figcaption>
    </figure>
  );
}
