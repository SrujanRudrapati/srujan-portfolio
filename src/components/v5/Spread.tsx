import { VIGNETTES } from "./art/drawings";
import { Scene, Vignette } from "./Art";
import { Pin } from "./Pin";
import s from "./spread.module.css";

type Props = {
  /** The section theme: picks the main scene and its three vignettes. */
  theme: string;
  /** The three captions, v1 to v2 to v3 (copy, from the data files). */
  captions: readonly [string, string, string];
  flip?: boolean;
};

/**
 * A project section's opening spread (design/redesign.html, 2026-11-13 update): the main scene in one
 * column and three small captioned drawings beside it (on phones, a row of three under it). The pins
 * sp0, vp1 and vp2 take the thread through the gap between the columns. Not in the prototype: vp3
 * (desktop only), below the spread and toward the heading's first pin. In the prototype the curve left
 * vp2 already turning toward that pin and clipped the bottom drawing beside the gap at 1440px; with vp3
 * the thread leaves the gap straight down, then bends toward the heading in the space under the
 * spread. Used on the home page and the project pages.
 */
export function Spread({ theme, captions, flip }: Props) {
  const vignettes = VIGNETTES[theme];
  if (!vignettes || vignettes.length !== captions.length) throw new Error(`v5 spread: "${theme}" needs ${captions.length} vignettes`);
  return (
    <div className={`${s.spread} ${flip ? s.flip : ""}`}>
      <Pin className={s.sp0} />
      <Scene name={theme} className={s.main} />
      <div className={s.vig}>
        <Pin className={s.vp1} />
        <Pin className={s.vp2} />
        <Pin className={s.vp3} />
        {vignettes.map((art, i) => (
          <figure key={captions[i]} className={`${s.v} ${s[`v${i + 1}`]}`}>
            <Vignette art={art} />
            <figcaption>{captions[i]}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
