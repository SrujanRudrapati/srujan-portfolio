import { LiveCard } from "./LiveCard";
import s from "../cards.module.css";

/** Surplus Station: listing time for a 100+ unit pallet, bars to scale (90 min before, 10 min now). */
export function PalletCard() {
  return (
    <LiveCard label="A 100+ unit pallet" meta="Listing time">
      <div className={s.swap} role="img" aria-label="Before: 1 to 2 hours. Now: about 10 minutes.">
        <div>
          <span>Before</span>
          <i />
          <span>1 to 2 h</span>
        </div>
        <div className={s.now}>
          <span>Now</span>
          <i />
          <span>~10 min</span>
        </div>
      </div>
      <small className={s.small}>Bars drawn to scale, using 90 minutes for “before”.</small>
    </LiveCard>
  );
}

/** DevHacks: Receipts catching a commitment in chat (an illustration, not a demo). */
export function ReceiptsCard() {
  return (
    <LiveCard label="Receipts" meta="Discord">
      <div className={s.chat}>
        <p className={s.msg}>
          <b>teammate</b>I’ll send the deck by Friday.
        </p>
        <p className={s.track}>Tracked: send the deck. Due Friday.</p>
      </div>
      <small className={s.small}>Illustration with a made-up chat.</small>
    </LiveCard>
  );
}
