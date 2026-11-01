import { graph, type GraphNode, type MetricNode } from "./graph.ts";
import { out } from "./graph/selectors.ts";

// The Experience timeline (runbook v4 W5), read from the graph: one lane per role with real dates, plus a
// Milestones lane for the DevHacks win. Lane names, bar labels and label sides are presentation; every date,
// title, organisation, outcome and figure comes from the role and event nodes.

/** The axis runs from mid-2022 (the internship) to early 2027, labelled 2023 to 2027 (reference). */
export const AXIS = { from: 2022.4, to: 2027.1, years: [2023, 2024, 2025, 2026, 2027] } as const;

export type TimelineLink = { label: string; href: string };

export type TimelineItem = {
  id: string;
  lane: string;
  kind: "role" | "milestone";
  /** Decimal years. A current role has no end: it runs to today. A milestone is a point. */
  start: number;
  end?: number;
  current: boolean;
  barLabel: string;
  /** Narrow bars carry their label outside so nothing is truncated (runbook W5.2). */
  labelSide: "in" | "left" | "right";
  when: string;
  title: string;
  org: string;
  place?: string;
  summary?: string;
  figures: { value: string; label: string }[];
  outcomes: { label?: string; text: string }[];
  links: TimelineLink[];
};

type Presentation = Pick<TimelineItem, "lane" | "barLabel" | "labelSide">;

/** Lanes top to bottom, oldest first. A role or milestone the graph adds without an entry here fails the build. */
const LANES: Record<string, Presentation> = {
  "role-intern-celebal": { lane: "Celebal, intern", barLabel: "Intern", labelSide: "right" },
  "role-associate-celebal": { lane: "Celebal, associate", barLabel: "Associate, Data Engineering", labelSide: "in" },
  "role-teaching-assistant-asu": { lane: "ASU, teaching", barLabel: "Teaching Assistant", labelSide: "in" },
  "role-tech-assistant-asu": { lane: "ASU Surplus", barLabel: "Tech Assistant", labelSide: "left" },
  "event-devhacks-win": { lane: "Milestones", barLabel: "1st place, DevHacks", labelSide: "left" },
};
export const LANE_ORDER = [...new Set(Object.values(LANES).map((l) => l.lane))];

/** "2022-07" as a decimal year: the start of the month, or with `endOfMonth` its end. */
export function monthToYear(ym: string, endOfMonth = false): number {
  const [y, m = "1"] = ym.split("-");
  const year = Number(y);
  const month = Number(m);
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) throw new Error(`experience: bad date ${ym}`);
  return year + (month - (endOfMonth ? 0 : 1)) / 12;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "2026-10" as "October 2026". */
export function monthLabel(ym: string): string {
  monthToYear(ym); // validates
  const [y, m] = ym.split("-");
  return `${MONTHS[Number(m) - 1]} ${y}`;
}

/** A date as a decimal year, for the "Today" line and the current role's end. */
export const dateToYear = (d: Date): number => d.getFullYear() + (d.getMonth() + (d.getDate() - 1) / 31) / 12;

/** Horizontal position on the axis, in percent, clamped to the axis. */
export const axisPercent = (year: number): number => (Math.min(AXIS.to, Math.max(AXIS.from, year)) - AXIS.from) / (AXIS.to - AXIS.from) * 100;

const byId = new Map<string, GraphNode>(graph.nodes.map((n) => [n.id, n]));

function figures(id: string): TimelineItem["figures"] {
  return out(graph, id, "achieved").map((e) => {
    const m = byId.get(e.to) as MetricNode;
    return { value: m.value, label: m.valueLabel };
  });
}

/** Projects built during a role ("during" edges point from the project to the role). */
function projectsDuring(roleId: string): TimelineLink[] {
  return graph.edges
    .filter((e) => e.type === "during" && e.to === roleId)
    .map((e) => byId.get(e.from))
    .filter((n): n is Extract<GraphNode, { type: "project" }> => n?.type === "project")
    .map((p) => ({ label: p.content.title, href: `/work/${p.id.replace(/^project-/, "")}` }));
}

function presentation(id: string): Presentation {
  const p = LANES[id];
  if (!p) throw new Error(`experience: no timeline lane for ${id}`);
  return p;
}

export function timeline(): TimelineItem[] {
  const roles = graph.nodes
    .filter((n): n is Extract<GraphNode, { type: "role" }> => n.type === "role")
    .map((r): TimelineItem => {
      if (!r.dates?.start) throw new Error(`experience: ${r.id} has no start date`);
      return {
        id: r.id,
        kind: "role",
        ...presentation(r.id),
        start: monthToYear(r.dates.start),
        ...(r.dates.end ? { end: monthToYear(r.dates.end, true) } : {}),
        current: !r.dates.end,
        when: r.content.dates,
        title: r.content.title,
        org: r.content.org,
        place: r.content.place,
        ...(r.content.summary ? { summary: r.content.summary } : r.content.outcomes.length === 0 ? { summary: r.summary } : {}),
        figures: figures(r.id),
        outcomes: r.content.outcomes,
        links: projectsDuring(r.id),
      };
    });
  const milestones = Object.keys(LANES)
    .filter((id) => id.startsWith("event-"))
    .map((id): TimelineItem => {
      const ev = byId.get(id);
      if (ev?.type !== "event" || !ev.dates?.start) throw new Error(`experience: missing dated event ${id}`);
      return {
        id,
        kind: "milestone",
        ...presentation(id),
        start: monthToYear(ev.dates.start) + 0.5 / 12, // the middle of its month
        current: false,
        when: monthLabel(ev.dates.start),
        title: ev.label,
        org: "Milestone",
        summary: ev.summary,
        figures: [],
        outcomes: [],
        links: (ev.evidence ?? []).filter((x) => x.url.startsWith("/work/")).map((x) => ({ label: x.label, href: x.url })),
      };
    });
  const items = [...roles, ...milestones];
  return LANE_ORDER.flatMap((lane) => items.filter((i) => i.lane === lane));
}

/** The item the detail panel opens on: the current role (runbook W5.3). */
export const defaultItemId = (items: TimelineItem[]): string => (items.find((i) => i.current) ?? items[items.length - 1]).id;
