import { Archivo, Martian_Mono } from "next/font/google";
import { about, profile } from "@/content/profile";
import { labFacts } from "../_lib/facts";
import { SpecSheet } from "./SpecSheet";

const display = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--c-display", display: "swap" });
const mono = Martian_Mono({ subsets: ["latin"], variable: "--c-mono", display: "swap" });

export const metadata = { title: "Lab C: The Spec Sheet" };

export default function LabC() {
  return (
    <div className={`${display.variable} ${mono.variable}`}>
      <SpecSheet facts={labFacts()} about={about} location={profile.location} />
    </div>
  );
}
