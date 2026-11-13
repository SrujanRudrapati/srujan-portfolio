import type { CardKind, ProjectSection as Data } from "@/data/home";
import { Ghost, Ring } from "../Art";
import { Spread } from "../Spread";
import { Giant } from "../Giant";
import { Pin } from "../Pin";
import { InvoiceToy } from "../cards/InvoiceToy";
import { LabelToy } from "../cards/LabelToy";
import { SyncToy } from "../cards/SyncToy";
import { PalletCard, ReceiptsCard } from "../cards/Illustrations";
import { Links } from "./Links";
import s from "../sections.module.css";

const CARDS: Record<CardKind, () => React.JSX.Element> = {
  pallet: PalletCard,
  invoice: InvoiceToy,
  label: LabelToy,
  sync: SyncToy,
  receipts: ReceiptsCard,
};

/** One featured project on the home page (prototype ".proj"). Pins alternate sides with `flip`. */
export function ProjectSection({ data, id }: { data: Data; id?: string }) {
  const Card = CARDS[data.card];
  // The thread enters each heading on one side and leaves on the other; flipped sections mirror it.
  const [enter, leave] = data.flip ? ["104%", "-4%"] : ["-4%", "104%"];
  const headingId = `${data.slug}-heading`;
  return (
    <section id={id} className={`${s.section} ${s.proj} ${data.flip ? s.flip : ""}`} data-theme={data.theme} data-reveal="" aria-labelledby={headingId}>
      <Pin left="50%" top="2%" />
      <div className={`${s.projTop} ${s.z}`}>
        <div className={s.mono}>{data.kicker}</div>
        <p>{data.lede}</p>
      </div>
      <Spread theme={data.theme} captions={data.spread} flip={data.flip} />
      <Giant lines={data.lines} name={data.name} id={headingId} href={`/work/${data.slug}`}>
        <Pin left={enter} top="12%" />
        <Pin left={leave} top="92%" />
        <Ghost name={data.theme} flip={data.flip} />
      </Giant>
      <div className={s.layout}>
        <div className={`${s.parts} ${s.z}`}>
          <dl className={s.dl}>
            {data.parts.map((p) => (
              <div key={p.term}>
                <dt>{p.term}</dt>
                <dd>{p.text}</dd>
              </div>
            ))}
          </dl>
          <ul className={s.nums}>
            {data.figures.map((f, i) => (
              <li key={f.value + f.label}>
                <b className={s.wide}>{i === 0 ? <Ring>{f.value}</Ring> : f.value}</b>
                {f.label}
              </li>
            ))}
          </ul>
          {data.stack.length > 0 && (
            <ul className={s.stack} aria-label="Stack">
              {data.stack.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          )}
          <Links links={data.links} />
          {data.placeholder && <p className={s.note}>[{data.placeholder}]</p>}
        </div>
        <Card />
      </div>
      <Pin {...(data.flip ? { left: "8%" } : { right: "8%" })} top="97%" />
    </section>
  );
}
