"use client";

import { useEffect, useState } from "react";

const TICK_MS = 20_000;
const ZONE = "America/Phoenix";

export function arizonaTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { timeZone: ZONE, hour: "numeric", minute: "2-digit" });
}

/** "Arizona, 3:42 PM", refreshed every 20 s. The server HTML says just "Arizona" (no stale time). */
export function Clock() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setTime(arizonaTime(new Date()));
    tick();
    const id = setInterval(tick, TICK_MS);
    return () => clearInterval(id);
  }, []);
  return (
    <span data-clock>
      Arizona
      {time ? `, ${time}` : ""}
    </span>
  );
}
