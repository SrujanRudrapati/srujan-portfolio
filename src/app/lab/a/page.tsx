import { Archivo, Martian_Mono } from "next/font/google";
import { labFacts } from "../_lib/facts";
import { Pipeline } from "./Pipeline";

// v3 direction (DECISIONS 11): A's structure with C's typography, blue accent.
const display = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--a-display", display: "swap" });
const mono = Martian_Mono({ subsets: ["latin"], variable: "--a-mono", display: "swap" });

export const metadata = { title: "Lab A: The Pipeline" };

export default function LabA() {
  return (
    <div className={`${display.variable} ${mono.variable}`}>
      <Pipeline facts={labFacts()} />
    </div>
  );
}
