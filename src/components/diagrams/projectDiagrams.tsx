"use client";

import { FlowDiagram, type FlowLayout } from "./FlowDiagram";

// Project diagrams. Every label below is copied from the old HTML diagrams in
// src/components/diagrams.tsx (commit 491260e) and src/data/projects.ts.
// Each diagram has a wide (desktop) and a narrow (phone) layout; see FlowDiagram.

const NARROW_TYPE = { label: 15, small: 12 };

/* Surplus AI: how a Mac goes from the shelf to a listing. */

const surplusPipelineWide: FlowLayout = {
  width: 1020,
  height: 240,
  nodes: [
    { id: "usb", x: 20, y: 20, w: 170, h: 64, label: "USB spec collector", sub: ["system_profiler on each", "working Mac"] },
    { id: "cam", x: 20, y: 156, w: 170, h: 64, label: "Camera scanner", sub: "Vision OCR on the bottom label" },
    { id: "lookup", x: 250, y: 88, w: 160, h: 64, label: "Lookup table", sub: ["Product, year, screen", "size, resale lane"] },
    { id: "inventory", x: 450, y: 88, w: 160, h: 64, label: "Master inventory", sub: "Keyed on serial number" },
    { id: "llm", x: 650, y: 88, w: 160, h: 64, label: "LLM", sub: ["Strict prompt:", "never invent specs"], variant: "accent" },
    { id: "listings", x: 850, y: 88, w: 150, h: 64, label: "Listings", sub: "Results saved" },
  ],
  edges: [
    { from: "usb", to: "lookup" },
    { from: "cam", to: "lookup" },
    { from: "lookup", to: "inventory" },
    { from: "inventory", to: "llm" },
    { from: "llm", to: "listings" },
  ],
  tracks: [
    { nodes: ["usb", "lookup", "inventory", "llm", "listings"] },
    { nodes: ["cam", "lookup", "inventory", "llm", "listings"], offset: -3 },
  ],
};

const surplusPipelineNarrow: FlowLayout = {
  width: 400,
  height: 540,
  type: NARROW_TYPE,
  nodes: [
    { id: "usb", x: 20, y: 20, w: 172, h: 80, label: "USB spec collector", sub: ["system_profiler on", "each working Mac"] },
    { id: "cam", x: 208, y: 20, w: 172, h: 80, label: "Camera scanner", sub: ["Vision OCR on the", "bottom label"] },
    { id: "lookup", x: 20, y: 150, w: 360, h: 68, label: "Lookup table", sub: "Product, year, screen size, resale lane" },
    { id: "inventory", x: 20, y: 258, w: 360, h: 68, label: "Master inventory", sub: "Keyed on serial number" },
    { id: "llm", x: 20, y: 366, w: 360, h: 68, label: "LLM", sub: "Strict prompt: never invent specs", variant: "accent" },
    { id: "listings", x: 20, y: 474, w: 360, h: 56, label: "Listings", sub: "Results saved" },
  ],
  edges: [
    { from: "usb", to: "lookup" },
    { from: "cam", to: "lookup" },
    { from: "lookup", to: "inventory" },
    { from: "inventory", to: "llm" },
    { from: "llm", to: "listings" },
  ],
  tracks: [
    { nodes: ["usb", "lookup", "inventory", "llm", "listings"] },
    { nodes: ["cam", "lookup", "inventory", "llm", "listings"], offset: -3 },
  ],
};

export function SurplusPipelineDiagram() {
  return (
    <FlowDiagram
      title="Surplus AI pipeline: from spec collection to AI-written listings"
      desc="Two spec sources, a USB collector for working Macs and a camera scanner for Macs that will not boot, feed a lookup table, then one master inventory keyed on serial number, then an LLM with a strict prompt that never invents specs, which writes the listings."
      caption="How a Mac goes from the shelf to a listing. Working Macs report their own specs; Macs that won't boot get their label scanned. Both land in one inventory keyed on serial number."
      wide={surplusPipelineWide}
      narrow={surplusPipelineNarrow}
    />
  );
}

/* Surplus AI: the five-node cluster. Head node reaches every node over SSH; nothing reaches the internet. */

const nodeIps = ["10.0.0.1", "10.0.0.2", "10.0.0.3", "10.0.0.4", "10.0.0.5"];
const nodeSub = (i: number): string[] =>
  i === 0 ? [nodeIps[i], "Head node"] : i === 4 ? [nodeIps[i]] : [nodeIps[i], "14B model files", "still copying"];

const surplusNetworkWide: FlowLayout = {
  width: 920,
  height: 300,
  nodes: [
    { id: "internet", x: 390, y: 12, w: 140, h: 36, label: "Internet", variant: "ghost" },
    { id: "switch", x: 60, y: 104, w: 800, h: 44, label: "Gigabit switch", variant: "accent" },
    ...nodeIps.map((_, i) => ({ id: `node${i + 1}`, x: 60 + i * 165, y: 210, w: 140, h: 76, label: `Node ${i + 1}`, sub: nodeSub(i) })),
  ],
  edges: [
    { from: "internet", to: "switch", dashed: true, arrow: false },
    ...nodeIps.map((_, i) => ({ from: "switch", to: `node${i + 1}` })),
  ],
  tracks: [2, 3, 4, 5].map((n, i) => ({ nodes: ["node1", "switch", `node${n}`], offset: -i * 1.5 })),
  notes: [{ x: 472, y: 82, text: "No uplink" }],
};

const surplusNetworkNarrow: FlowLayout = {
  width: 400,
  height: 520,
  type: NARROW_TYPE,
  nodes: [
    { id: "internet", x: 20, y: 12, w: 150, h: 36, label: "Internet", variant: "ghost" },
    { id: "switch", x: 20, y: 90, w: 150, h: 44, label: "Gigabit switch", variant: "accent" },
    ...nodeIps.map((_, i) => ({ id: `node${i + 1}`, x: 210, y: 70 + i * 90, w: 170, h: 70, label: `Node ${i + 1}`, sub: nodeSub(i) })),
  ],
  edges: [
    { from: "internet", to: "switch", dashed: true, arrow: false },
    ...nodeIps.map((_, i) => ({ from: "switch", to: `node${i + 1}` })),
  ],
  tracks: [2, 3, 4, 5].map((n, i) => ({ nodes: ["node1", "switch", `node${n}`], offset: -i * 1.5 })),
  notes: [{ x: 104, y: 74, text: "No uplink" }],
};

export function SurplusNetworkDiagram() {
  return (
    <FlowDiagram
      title="Cluster network: five Mac minis on a switch with no internet uplink"
      desc="A gigabit switch with no uplink to the internet connects five Mac mini nodes with fixed IPs 10.0.0.1 to 10.0.0.5. Node 1 is the head node and reaches the others over SSH. Nodes 2 through 4 are still receiving the 14B model files."
      caption="Five M1 Mac minis on an isolated gigabit switch with fixed IPs and passwordless SSH from the head node. Nodes 2 through 4 are still receiving the 14B model files."
      wide={surplusNetworkWide}
      narrow={surplusNetworkNarrow}
    />
  );
}

/* Surplus AI: four layers between the model and the internet. The dot leaves the app and never gets past the switch. */

const privacyLayers = [
  "No uplink on the switch",
  "Wi-Fi off",
  "HF_HUB_OFFLINE=1, so the model software can't download anything",
  "Model server only answers on localhost",
];

function privacyLayout(width: number, sideInset: number, topInset: number, labels: (string | string[])[], type?: FlowLayout["type"]): FlowLayout {
  const height = 60 + privacyLayers.length * (topInset + 16) + 56;
  const nodes = privacyLayers.map((_, i) => {
    const x = 20 + i * sideInset;
    const y = 60 + i * topInset;
    const label = labels[i];
    return {
      id: `layer${i + 1}`,
      x,
      y,
      w: width - 40 - 2 * i * sideInset,
      h: height - 16 - y - i * 16,
      label: Array.isArray(label) ? label[0] : label,
      sub: Array.isArray(label) ? label.slice(1) : undefined,
      align: "start" as const,
      anchor: "top" as const,
      fill: i % 2 === 0 ? ("bg" as const) : ("surface" as const),
    };
  });
  const last = nodes[nodes.length - 1];
  const core = { id: "app", x: last.x + 14, y: last.y + last.h - 14 - 44, w: last.w - 28, h: 44, label: "Surplus AI", variant: "accent" as const };
  return {
    width,
    height,
    type,
    nodes: [{ id: "internet", x: width / 2 - 70, y: 8, w: 140, h: 34, label: "Internet", variant: "ghost" }, ...nodes, core],
    edges: [],
    tracks: [{ nodes: ["app", "layer4", "layer3", "layer2", "layer1"] }],
  };
}

const surplusPrivacyWide = privacyLayout(920, 18, 38, privacyLayers);
const surplusPrivacyNarrow = privacyLayout(
  400,
  12,
  50,
  [
    "No uplink on the switch",
    "Wi-Fi off",
    ["HF_HUB_OFFLINE=1, so the model", "software can't download anything"],
    ["Model server only answers", "on localhost"],
  ],
  NARROW_TYPE,
);

export function SurplusPrivacyDiagram() {
  return (
    <FlowDiagram
      title="Privacy layers between Surplus AI and the internet"
      desc={`Surplus AI sits inside four layers, innermost first: ${[...privacyLayers].reverse().join("; ")}. The internet is outside all of them and is never reached.`}
      caption="Four layers sit between the model and the internet. The app checks Wi-Fi and internet status live."
      wide={surplusPrivacyWide}
      narrow={surplusPrivacyNarrow}
      loopSeconds={5}
    />
  );
}

/* Supply Chain Watchtower: three agents in sequence; only the Risk Analyst has a tool. */

const watchtowerWide: FlowLayout = {
  width: 1010,
  height: 282,
  nodes: [
    { id: "input", x: 20, y: 70, w: 150, h: 72, label: "Sales history", kicker: "Input", variant: "ghost" },
    { id: "a1", x: 210, y: 70, w: 170, h: 72, label: "Inventory Forecaster", kicker: "Agent 1" },
    { id: "a2", x: 420, y: 70, w: 170, h: 72, label: "Risk Analyst", kicker: "Agent 2" },
    { id: "tool", x: 420, y: 190, w: 170, h: 76, label: "RAG tool", kicker: "Tool", sub: ["ChromaDB,", "shipping-disruption data"], variant: "accent" },
    { id: "a3", x: 630, y: 70, w: 170, h: 72, label: "Logistics Coordinator", kicker: "Agent 3" },
    { id: "output", x: 840, y: 70, w: 150, h: 72, label: "Logistics plan", kicker: "Output", variant: "ghost" },
  ],
  edges: [
    { from: "input", to: "a1" },
    { from: "a1", to: "a2" },
    { from: "a2", to: "a3" },
    { from: "a3", to: "output" },
    { from: "a2", to: "tool", dashed: true, arrow: false },
  ],
  tracks: [{ nodes: ["input", "a1", "a2", "tool", "a2", "a3", "output"] }],
};

const watchtowerNarrow: FlowLayout = {
  width: 400,
  height: 540,
  type: NARROW_TYPE,
  nodes: [
    { id: "input", x: 20, y: 16, w: 360, h: 60, label: "Sales history", kicker: "Input", variant: "ghost" },
    { id: "a1", x: 20, y: 110, w: 360, h: 64, label: "Inventory Forecaster", kicker: "Agent 1" },
    { id: "a2", x: 20, y: 208, w: 360, h: 64, label: "Risk Analyst", kicker: "Agent 2" },
    { id: "tool", x: 20, y: 306, w: 170, h: 76, label: "RAG tool", kicker: "Tool", sub: ["ChromaDB, shipping-", "disruption data"], variant: "accent" },
    { id: "a3", x: 20, y: 400, w: 360, h: 64, label: "Logistics Coordinator", kicker: "Agent 3" },
    { id: "output", x: 20, y: 480, w: 360, h: 56, label: "Logistics plan", kicker: "Output", variant: "ghost" },
  ],
  edges: [
    { from: "input", to: "a1" },
    { from: "a1", to: "a2" },
    { from: "a2", to: "tool", dashed: true, arrow: false },
    { from: "a2", to: "a3" },
    { from: "a3", to: "output" },
  ],
  tracks: [{ nodes: ["input", "a1", "a2", "tool", "a2", "a3", "output"] }],
};

export function WatchtowerFlowDiagram() {
  return (
    <FlowDiagram
      title="Watchtower agent flow: sales history to logistics plan through three agents"
      desc="Sales history goes to Agent 1, the Inventory Forecaster, then Agent 2, the Risk Analyst, which calls a RAG tool over ChromaDB shipping-disruption data, then Agent 3, the Logistics Coordinator, which produces the logistics plan."
      caption="Three agents run in sequence, each consuming the previous agent's output. Only the Risk Analyst has a tool: retrieval over real shipping-disruption data in ChromaDB."
      wide={watchtowerWide}
      narrow={watchtowerNarrow}
      loopSeconds={7}
    />
  );
}

/* Registry: projects.ts refers to diagrams by key. */

const registry = {
  "surplus-pipeline": SurplusPipelineDiagram,
  "surplus-network": SurplusNetworkDiagram,
  "surplus-privacy": SurplusPrivacyDiagram,
  "watchtower-flow": WatchtowerFlowDiagram,
} as const;

export type DiagramKey = keyof typeof registry;

export function ProjectDiagram({ name }: { name: string }) {
  const Diagram = registry[name as DiagramKey];
  if (!Diagram) throw new Error(`ProjectDiagram: no diagram registered as "${name}"`);
  return <Diagram />;
}
