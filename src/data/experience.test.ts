import { describe, expect, it } from "vitest";
import { AXIS, axisPercent, dateToYear, defaultItemId, LANE_ORDER, monthLabel, monthToYear, timeline } from "./experience";

describe("experience timeline: dates", () => {
  it("turns months into decimal years, start or end of the month", () => {
    expect(monthToYear("2022-07")).toBeCloseTo(2022.5);
    expect(monthToYear("2022-08", true)).toBeCloseTo(2022 + 8 / 12);
    expect(monthToYear("2026-01")).toBe(2026);
  });

  it("rejects malformed months", () => {
    expect(() => monthToYear("2026-13")).toThrow(/bad date/);
    expect(() => monthToYear("soon")).toThrow(/bad date/);
  });

  it("labels months in words", () => {
    expect(monthLabel("2026-10")).toBe("October 2026");
  });

  it("places years on the axis and clamps outside it", () => {
    expect(axisPercent(AXIS.from)).toBe(0);
    expect(axisPercent(AXIS.to)).toBe(100);
    expect(axisPercent(2019)).toBe(0);
    expect(axisPercent(2030)).toBe(100);
    expect(dateToYear(new Date(2026, 10, 1))).toBeCloseTo(2026 + 10 / 12);
  });
});

describe("experience timeline: data", () => {
  const items = timeline();

  it("has every graph role with real dates, one lane each, plus the DevHacks milestone, oldest first", () => {
    expect(items.map((i) => i.lane)).toEqual(LANE_ORDER);
    expect(items.map((i) => i.title)).toEqual([
      "Intern, Data Engineering",
      "Associate, Data Engineering",
      "Graduate Teaching Assistant",
      "Tech Assistant, Surplus Operations",
      "1st place, DevHacks × Cubbie hackathon",
    ]);
    for (const i of items) if (i.end !== undefined) expect(i.end).toBeGreaterThan(i.start);
  });

  it("dates come from the graph: Celebal Jul 2022 to Nov 2024, ASU Surplus from June 2026 and current", () => {
    const [intern, associate, , surplus, win] = items;
    expect(intern.start).toBeCloseTo(2022.5);
    expect(associate.end).toBeCloseTo(2024 + 11 / 12);
    expect(surplus.current).toBe(true);
    expect(surplus.end).toBeUndefined();
    expect(win.kind).toBe("milestone");
    expect(win.when).toBe("October 2026");
  });

  it("keeps each role’s figures, outcomes and projects", () => {
    const associate = items[1];
    expect(associate.figures.map((f) => f.value)).toEqual(["about 50%", "about 10 million", "about 30%"]);
    expect(associate.outcomes.length).toBeGreaterThan(5);
    expect(items[3].links).toEqual([{ label: "Surplus Station", href: "/work/surplus-station" }]);
    expect(items[4].links.map((l) => l.href)).toEqual(["/work/devhacks-cubbie"]);
  });

  it("gives the internship, which has no outcomes, its graph summary instead", () => {
    expect(items[0].outcomes).toEqual([]);
    expect(items[0].summary).toMatch(/July and August 2022/);
  });

  it("opens on the current role", () => {
    expect(defaultItemId(items)).toBe("role-tech-assistant-asu");
  });
});
