"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { GAME_OPEN } from "./events";
import s from "./game.module.css";

// "Clean the pipeline" from the command palette (runbook V3/V6): a native modal dialog,
// mounted once in the layout. The game's code loads the first time it opens, and the game
// unmounts on close, so its loop never runs in the background. Escape or Close returns
// focus to whatever opened it.
const PipelineGame = dynamic(() => import("./PipelineGame").then((m) => m.PipelineGame), { ssr: false, loading: () => <p className={s.help}>Loading the game…</p> });

export function GameDialog() {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => {
      opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setOpen(true);
      dialog.current?.showModal();
    };
    window.addEventListener(GAME_OPEN, onOpen);
    return () => window.removeEventListener(GAME_OPEN, onOpen);
  }, []);

  const onClose = () => {
    setOpen(false);
    const target = opener.current;
    if (target?.isConnected && target.offsetParent !== null) target.focus();
  };

  return (
    <dialog ref={dialog} aria-labelledby="game-title" className={s.dialog} onClose={onClose}>
      <div className={s.dialogHead}>
        <p className={s.dialogStage}>stage 04 / query</p>
        <h2 id="game-title" className={s.dialogTitle}>
          Clean the pipeline
        </h2>
        <button type="button" className={s.close} onClick={() => dialog.current?.close()}>
          Close
        </button>
      </div>
      {open && <PipelineGame autoFocus />}
    </dialog>
  );
}
