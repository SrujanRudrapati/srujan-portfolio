import { IBM_Plex_Mono, Newsreader } from "next/font/google";
import { profile } from "@/content/profile";
import { labFacts } from "../_lib/facts";
import { Notebook } from "./Notebook";

const serif = Newsreader({ subsets: ["latin"], axes: ["opsz"], style: ["normal", "italic"], variable: "--b-serif", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--b-mono", display: "swap" });

export const metadata = { title: "Lab B: The Notebook" };

export default function LabB() {
  return (
    <div className={`${serif.variable} ${mono.variable}`}>
      <Notebook facts={labFacts()} location={profile.location} />
    </div>
  );
}
