// The Experience timeline's axis (runbook v4 W5): pure helpers with no graph import, so the
// client chart can use them without pulling the knowledge graph into the browser bundle.

/** The axis runs from mid-2022 (the internship) to early 2027, labelled 2023 to 2027 (reference). */
export const AXIS = { from: 2022.4, to: 2027.1, years: [2023, 2024, 2025, 2026, 2027] } as const;

/** A date as a decimal year, for the "Today" line and the current role's end. */
export const dateToYear = (d: Date): number => d.getFullYear() + (d.getMonth() + (d.getDate() - 1) / 31) / 12;

/** Horizontal position on the axis, in percent, clamped to the axis. */
export const axisPercent = (year: number): number => (Math.min(AXIS.to, Math.max(AXIS.from, year)) - AXIS.from) / (AXIS.to - AXIS.from) * 100;

