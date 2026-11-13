import type { CSSProperties } from "react";
import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { GHOSTS, ICONS, SCENES, type Art as ArtData } from "./art/drawings";
import s from "./art.module.css";

const SHAPES = new Set(["path", "rect", "circle", "ellipse"]);
const STAGGER_S = 0.035;

/** Gives every stroke in a scene its draw delay (--d), in drawing order, as the prototype's script did. */
function stagger(node: ReactNode, counter: { i: number }): ReactNode {
  return Children.map(node, (child) => {
    if (!isValidElement(child)) return child;
    const el = child as ReactElement<{ children?: ReactNode; style?: CSSProperties }>;
    const kids = el.props.children !== undefined ? stagger(el.props.children, counter) : undefined;
    if (typeof el.type === "string" && SHAPES.has(el.type)) {
      const d = (counter.i++ * STAGGER_S).toFixed(2);
      return cloneElement(el, { style: { ...el.props.style, "--d": d } as CSSProperties }, kids);
    }
    return kids !== undefined ? cloneElement(el, undefined, kids) : el;
  });
}

function need(table: Record<string, ArtData>, key: string, kind: string): ArtData {
  const art = table[key];
  if (!art) throw new Error(`v5 art: no ${kind} "${key}"`);
  return art;
}

/** A self-drawing line-art scene (draws when its section gets [data-in]). */
export function Scene({ name, className }: { name: string; className?: string }) {
  const art = need(SCENES, name, "scene");
  return (
    <svg className={`${s.art} ${s.scene} ${className ?? ""}`} viewBox={art.viewBox} role="img" aria-label={art.label}>
      {stagger(art.body, { i: 0 })}
    </svg>
  );
}

/** A spread's small drawing: decorative (its figcaption says what it shows), drawn like a scene. */
export function Vignette({ art }: { art: ArtData }) {
  return (
    <svg className={`${s.art} ${s.scene}`} viewBox={art.viewBox} aria-hidden="true">
      {stagger(art.body, { i: 0 })}
    </svg>
  );
}

/** The faint background drawing behind a giant heading; the thread loop moves it (parallax). */
export function Ghost({ name, flip }: { name: string; flip?: boolean }) {
  const art = need(GHOSTS, name, "ghost");
  return (
    <svg className={`${s.art} ${s.ghost} ${flip ? s.ghostFlip : ""}`} viewBox={art.viewBox} aria-hidden="true" data-ghost={flip ? "flip" : ""}>
      {art.body}
    </svg>
  );
}

export function Icon({ name }: { name: string }) {
  const art = need(ICONS, name, "icon");
  return (
    <svg className={s.ico} viewBox={art.viewBox} aria-hidden="true">
      {art.body}
    </svg>
  );
}

/** The hand-drawn ring around a headline figure. */
export function Ring({ children }: { children: ReactNode }) {
  return (
    <span className={s.ring}>
      {children}
      <svg viewBox="0 0 200 80" preserveAspectRatio="none" aria-hidden="true">
        <path d="M14 46C8 22 58 7 108 8s86 13 80 35-50 31-100 29S12 64 22 33" />
      </svg>
    </span>
  );
}
