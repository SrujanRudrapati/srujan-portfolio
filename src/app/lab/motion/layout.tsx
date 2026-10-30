import { Archivo, Martian_Mono } from "next/font/google";
import { MotionRoot } from "@/components/motion/MotionRoot";
import s from "./demo.module.css";

// V2 demo of every motion primitive. MotionRoot lives here until V3 moves it to the
// root layout, so the canvas, smooth scroll and transitions persist across both pages.
const display = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--a-display", display: "swap" });
const mono = Martian_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export default function MotionLabLayout({ children }: LayoutProps<"/lab/motion">) {
  return (
    <div className={`${display.variable} ${mono.variable} ${s.root}`}>
      <MotionRoot />
      {children}
    </div>
  );
}
