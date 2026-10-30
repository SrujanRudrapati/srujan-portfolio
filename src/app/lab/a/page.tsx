import { Geist, Geist_Mono } from "next/font/google";
import { labFacts } from "../_lib/facts";
import { Pipeline } from "./Pipeline";

const display = Geist({ subsets: ["latin"], variable: "--a-display", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--a-mono", display: "swap" });

export const metadata = { title: "Lab A: The Pipeline" };

export default function LabA() {
  return (
    <div className={`${display.variable} ${mono.variable}`}>
      <Pipeline facts={labFacts()} />
    </div>
  );
}
