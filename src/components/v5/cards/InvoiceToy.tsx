"use client";

import { useState } from "react";
import { LiveCard } from "./LiveCard";
import s from "../cards.module.css";

const ROWS = [
  { item: "Cables", qty: 4, unit: "12.00", amount: "48.00" },
  { item: "Adapters", qty: 2, unit: "30.00", amount: "60.00" },
];
const GOOD = "Auto-approved. Every value was found on the page and the math adds up.";
const BAD = "Sent to a person. The page says 180.00, but 48.00 + 60.00 is 108.00.";

/** InvoiceGuard, the toy version: tamper with the total and the check sends it to a person. */
export function InvoiceToy() {
  const [tampered, setTampered] = useState(false);
  return (
    <LiveCard label="Try it" meta="Invoice 1042" className={tampered ? s.bad : undefined}>
      <div className={s.inv} role="table" aria-label="Invoice 1042">
        <div role="row">
          <span role="columnheader">Item</span>
          <span role="columnheader">Qty</span>
          <span role="columnheader">Unit</span>
          <span role="columnheader">Amount</span>
        </div>
        {ROWS.map((r) => (
          <div role="row" key={r.item}>
            <span role="cell">{r.item}</span>
            <span role="cell">{r.qty}</span>
            <span role="cell">{r.unit}</span>
            <span role="cell">{r.amount}</span>
          </div>
        ))}
        <div role="row" className={s.tot}>
          <span role="cell">Total</span>
          <b role="cell">{tampered ? "180.00" : "108.00"}</b>
        </div>
      </div>
      <p className={s.verdict} aria-live="polite">
        {tampered ? BAD : GOOD}
      </p>
      <button type="button" className={s.btn} onClick={() => setTampered((t) => !t)}>
        {tampered ? "Put it back" : "Tamper with the total"}
      </button>
      <small className={s.small}>A toy version with sample numbers. The real one is in the live demo.</small>
    </LiveCard>
  );
}
