"use client";

import { useId, type CSSProperties } from "react";
import { useInView } from "@/hooks/use-in-view";

// One engine for every project diagram. A diagram is a set of boxes, the
// connectors drawn between them, and "tracks": ordered lists of boxes a dot
// travels through. Each box gets a lit overlay (opacity animated) per dot
// arrival, phased from the path length, so stages light in order and the data
// drives the timing; nothing is hand-measured.
//
// Motion rules (design-direction skill): dots and lighting run only while the
// figure is on screen and the tab is visible (useInView), only under
// prefers-reduced-motion: no-preference, and only where offset-path is
// supported. The default, with no JavaScript or reduced motion, is every box
// lit and still, which reads fully on its own. Styles: .flow-* in globals.css.
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
  /** Dots sharing this path, spread evenly over the loop. */
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
  /** Seconds for one full loop of a track. */
  loopSeconds?: number;
  className?: string;
};

type Point = { x: number; y: number };
type Dir = "up" | "down" | "left" | "right";
type Lit = { arrive: number; period: number };
type DotPath = { d: string; dots: number; offset: number };
type NodeMap = Map<string, FlowNode>;

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

/** One lit overlay per (track, arrival). A node on two tracks, or visited twice, lights every time a dot reaches it. */
function lighting(layout: FlowLayout, byId: NodeMap, loopSeconds: number): { lit: Map<string, Lit[]>; paths: DotPath[] } {
  const lit = new Map<string, Lit[]>();
  const paths: DotPath[] = [];
  for (const track of layout.tracks) {
    const dots = Math.max(1, track.dots ?? 1);
    const offset = track.offset ?? 0;
    const { d, arrivals } = trackGeometry(track, byId);
    paths.push({ d, dots, offset });
    // A node sees `dots` arrivals per loop, so its flash period is loop/dots.
    // The dot's delay shifts every arrival by the same amount.
    const period = loopSeconds / dots;
    for (const { id, at } of arrivals) {
      const phase = at * dots + offset / period;
      lit.set(id, [...(lit.get(id) ?? []), { arrive: ((phase % 1) + 1) % 1, period }]);
    }
  }
  return { lit, paths };
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

function Edges({ layout, byId }: { layout: FlowLayout; byId: NodeMap }) {
  return (
    <g fill="none" stroke="var(--accent-2)" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      {layout.edges.map((edge) => {
        const { d, tip, dir } = edgeGeometry(nodeById(byId, edge.from), nodeById(byId, edge.to));
        return (
          <g key={`${edge.from}-${edge.to}`} strokeDasharray={edge.dashed ? "4 4" : undefined}>
            <path d={d} />
            {edge.arrow !== false && <path d={arrowhead(tip, dir)} strokeDasharray="none" />}
          </g>
        );
      })}
    </g>
  );
}

function Dots({ paths, loopSeconds }: { paths: DotPath[]; loopSeconds: number }) {
  // Drawn before the boxes so dots pass beneath each one.
  return (
    <g aria-hidden="true">
      {paths.map((path, i) =>
        Array.from({ length: path.dots }, (_, k) => (
          <circle
            key={`${i}-${k}`}
            className="flow-dot"
            r="4.5"
            fill="var(--accent-2)"
            style={{ offsetPath: `path("${path.d}")`, animationDelay: `${path.offset - (k * loopSeconds) / path.dots}s` }}
          />
        )),
      )}
    </g>
  );
}

function NodeText({ node, type }: { node: FlowNode; type: FlowType }) {
  const muted = "var(--text-muted)";
  const ink = node.variant === "ghost" ? muted : "var(--text)";
  const c = centre(node);
  if (node.vertical) {
    return (
      <text x={c.x} y={c.y + type.label * 0.35} textAnchor="middle" fontSize={type.label} fontWeight={700} fill={ink} className="flow-text flow-label" transform={`rotate(-90 ${c.x} ${c.y})`}>
        {lines(node.label).join(" ")}
      </text>
    );
  }
  const rows = [
    ...(node.kicker ? [{ text: node.kicker, size: type.small, weight: 500, fill: muted }] : []),
    ...lines(node.label).map((text) => ({ text, size: type.label, weight: 700, fill: ink })),
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
            className={row.weight === 700 ? "flow-text flow-label" : "flow-text"}
          >
            {row.text}
          </text>
        );
      })}
    </>
  );
}

function Nodes({ layout, lit, type }: { layout: FlowLayout; lit: Map<string, Lit[]>; type: FlowType }) {
  return (
    <>
      {layout.nodes.map((node) => {
        const stroke = node.variant === "accent" ? "var(--accent-2)" : node.variant === "ghost" ? "var(--text-muted)" : "var(--text)";
        const box = { x: node.x, y: node.y, width: node.w, height: node.h };
        return (
          <g key={node.id} className="flow-node">
            <rect {...box} fill={node.fill === "surface" ? "var(--surface)" : "var(--bg)"} stroke={stroke} strokeWidth={node.variant === "accent" ? 2 : 1} strokeDasharray={node.variant === "ghost" ? "4 3" : undefined} />
            {(lit.get(node.id) ?? []).map((glow, i) => (
              <rect key={i} className="flow-lit" {...box} fill="var(--flow-lit)" style={{ "--arrive": glow.arrive, "--period": `${glow.period}s` } as CSSProperties} />
            ))}
            <NodeText node={node} type={type} />
          </g>
        );
      })}
    </>
  );
}

function Layout({ layout, loopSeconds, ids, title, desc, className }: { layout: FlowLayout; loopSeconds: number; ids: [string, string]; title: string; desc: string; className: string }) {
  const byId: NodeMap = new Map(layout.nodes.map((n) => [n.id, n]));
  const { lit, paths } = lighting(layout, byId, loopSeconds);
  const type = layout.type ?? DEFAULT_TYPE;
  return (
    <svg viewBox={`0 0 ${layout.width} ${layout.height}`} role="img" aria-labelledby={ids.join(" ")} className={`h-auto w-full ${className}`} style={{ "--loop": `${loopSeconds}s` } as CSSProperties}>
      <title id={ids[0]}>{title}</title>
      <desc id={ids[1]}>{desc}</desc>
      <Edges layout={layout} byId={byId} />
      <Dots paths={paths} loopSeconds={loopSeconds} />
      <Nodes layout={layout} lit={lit} type={type} />
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
    <figure ref={ref} data-animate={active ? "on" : undefined} className={`flow border-t-[3px] border-ink bg-surface p-4 md:p-8 ${className}`}>
      {/* One layout per breakpoint. The hidden one is display:none, so it has no animation cost and screen readers skip it. */}
      <Layout layout={wide} loopSeconds={loopSeconds} ids={[`${uid}-wt`, `${uid}-wd`]} title={title} desc={desc} className="hidden lg:block" />
      <Layout layout={narrow} loopSeconds={loopSeconds} ids={[`${uid}-nt`, `${uid}-nd`]} title={title} desc={desc} className="max-w-[400px] lg:hidden" />
      <figcaption className="mt-5 max-w-measure text-sm text-muted">{caption}</figcaption>
    </figure>
  );
}
