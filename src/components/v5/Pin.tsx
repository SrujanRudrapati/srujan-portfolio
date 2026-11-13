import type { CSSProperties } from "react";
import s from "./art.module.css";

type Props = {
  /** Position inside the nearest positioned ancestor, as CSS lengths ("84%", "-4%"). */
  left?: string;
  right?: string;
  /** Optional when a className positions the pin (the spread's responsive pins). */
  top?: string;
  /** The last pin: the kolam's centre. */
  kolam?: boolean;
  className?: string;
};

/** A point the thread passes through, in document order (design/redesign.html ".pin"). */
export function Pin({ left, right, top, kolam, className }: Props) {
  const style: CSSProperties = { ...(top !== undefined ? { top } : {}), ...(left !== undefined ? { left } : {}), ...(right !== undefined ? { right } : {}) };
  return <i aria-hidden="true" className={`${s.pin} ${className ?? ""}`} style={style} data-pin={kolam ? "kolam" : ""} />;
}
