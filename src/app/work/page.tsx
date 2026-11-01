import type { Metadata } from "next";
import { WorkView } from "@/components/catalogue/WorkView";
import { BackPill } from "@/components/shell/BackPill";
import { workItems } from "@/data/work";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta("/work", "Work | Srujan Rudrapati", "Every project, from offline AI in production to hardware: the featured four as a catalogue, all eleven as a list.");

const COUNT_WORDS: Record<number, string> = { 10: "Ten", 11: "Eleven", 12: "Twelve", 13: "Thirteen" };

// Runbook v4 W3: back pill, title, intro, Catalogue / List.
export default function WorkPage() {
  const items = workItems();
  const count = COUNT_WORDS[items.length] ?? String(items.length);
  return (
    <main id="main" className="page">
      <div className="wrap">
        <BackPill />
        <WorkView intro={`${count} projects, from offline AI in production to hardware. Each one leads with what it does and what changed.`} items={items} />
      </div>
    </main>
  );
}
