import { Archivo, Martian_Mono } from "next/font/google";
import s from "./demo.module.css";

// V2 demo of every motion primitive. MotionRoot is in the root layout (V3), so the canvas,
// smooth scroll and transitions persist across both pages.
const display = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--a-display", display: "swap" });
const mono = Martian_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export default function MotionLabLayout({ children }: LayoutProps<"/lab/motion">) {
  return (
    <div className={`${display.variable} ${mono.variable} ${s.root}`}>
      {children}
    </div>
  );
}
