"use client";

import { FlowDiagram, type FlowLayout } from "./FlowDiagram";

// Project diagrams. Every label below is copied from the old HTML diagrams in
// src/components/diagrams.tsx (commit 491260e) and src/data/projects.ts.
// Each diagram has a wide layout (1024px and up, ~1000px slot) and a narrow one
// drawn on a 300-unit canvas for the ~280px slot a 390px phone gives it, so
// text stays at or above 12px rendered. See FlowDiagram for the engine.

const flowEdges = (pairs: [string, string][]): FlowLayout["edges"] => pairs.map(([from, to]) => ({ from, to }));

/* Surplus AI: how a Mac goes from the shelf to a listing. */

const pipelineEdges = flowEdges([
  ["usb", "lookup"],
  ["cam", "lookup"],
  ["lookup", "inventory"],
  ["inventory", "llm"],
  ["llm", "listings"],
]);
const pipelineTracks: FlowLayout["tracks"] = [
  { nodes: ["usb", "lookup", "inventory", "llm", "listings"] },
  { nodes: ["cam", "lookup", "inventory", "llm", "listings"], offset: -3 },
];

const surplusPipelineWide: FlowLayout = {
  width: 1020,
  height: 240,
  nodes: [
    { id: "usb", x: 20, y: 20, w: 180, h: 64, label: "USB spec collector", sub: ["system_profiler on each", "working Mac"] },
    { id: "cam", x: 20, y: 156, w: 180, h: 64, label: "Camera scanner", sub: ["Vision OCR on the", "bottom label"] },
    { id: "lookup", x: 260, y: 88, w: 170, h: 64, label: "Lookup table", sub: ["Product, year, screen", "size, resale lane"] },
    { id: "inventory", x: 460, y: 88, w: 170, h: 64, label: "Master inventory", sub: "Keyed on serial number" },
    { id: "llm", x: 660, y: 88, w: 170, h: 64, label: "LLM", sub: ["Strict prompt:", "never invent specs"], variant: "accent" },
    { id: "listings", x: 860, y: 88, w: 140, h: 64, label: "Listings", sub: "Results saved" },
  ],
  edges: pipelineEdges,
  tracks: pipelineTracks,
};

const surplusPipelineNarrow: FlowLayout = {
  width: 300,
  height: 492,
  nodes: [
    { id: "usb", x: 10, y: 10, w: 135, h: 88, label: ["USB spec", "collector"], sub: ["system_profiler on", "each working Mac"] },
    { id: "cam", x: 155, y: 10, w: 135, h: 88, label: ["Camera", "scanner"], sub: ["Vision OCR on", "the bottom label"] },
    { id: "lookup", x: 10, y: 142, w: 280, h: 64, label: "Lookup table", sub: ["Product, year, screen", "size, resale lane"] },
    { id: "inventory", x: 10, y: 246, w: 280, h: 52, label: "Master inventory", sub: "Keyed on serial number" },
    { id: "llm", x: 10, y: 338, w: 280, h: 52, label: "LLM", sub: "Strict prompt: never invent specs", variant: "accent" },
    { id: "listings", x: 10, y: 430, w: 280, h: 52, label: "Listings", sub: "Results saved" },
  ],
  edges: pipelineEdges,
  tracks: pipelineTracks,
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
// Qwen 14B runs across four nodes and Llama 3B on one (facts 2.1); node 1 is the head node.
const nodeSub = (i: number): string[] => [nodeIps[i], i === 0 ? "Head node, Qwen 14B" : i === 4 ? "Llama 3B" : "Qwen 14B"];
const networkEdges: FlowLayout["edges"] = [
  { from: "internet", to: "switch", dashed: true, arrow: false },
  ...nodeIps.map((_, i) => ({ from: "switch", to: `node${i + 1}` })),
];
const networkTracks: FlowLayout["tracks"] = [2, 3, 4, 5].map((n, i) => ({ nodes: ["node1", "switch", `node${n}`], offset: -i * 1.5 }));

const surplusNetworkWide: FlowLayout = {
  width: 920,
  height: 300,
  nodes: [
    { id: "internet", x: 390, y: 12, w: 140, h: 36, label: "Internet", variant: "ghost" },
    { id: "switch", x: 60, y: 104, w: 800, h: 44, label: "Gigabit switch", variant: "accent" },
    ...nodeIps.map((_, i) => ({ id: `node${i + 1}`, x: 60 + i * 165, y: 210, w: 140, h: 64, label: `Node ${i + 1}`, sub: nodeSub(i) })),
  ],
  edges: networkEdges,
  tracks: networkTracks,
  notes: [{ x: 472, y: 82, text: "No uplink" }],
};

const surplusNetworkNarrow: FlowLayout = {
  width: 300,
  height: 482,
  nodes: [
    { id: "internet", x: 10, y: 10, w: 110, h: 34, label: "Internet", variant: "ghost" },
    { id: "switch", x: 10, y: 70, w: 44, h: 400, label: "Gigabit switch", variant: "accent", vertical: true },
    ...nodeIps.map((_, i) => ({ id: `node${i + 1}`, x: 84, y: 70 + i * 84, w: 206, h: 60, label: `Node ${i + 1}`, sub: nodeSub(i) })),
  ],
  edges: networkEdges,
  tracks: networkTracks,
  notes: [{ x: 62, y: 62, text: "No uplink" }],
};

export function SurplusNetworkDiagram() {
  return (
    <FlowDiagram
      title="Cluster network: five Mac minis on a switch with no internet uplink"
      desc="A gigabit switch with no uplink to the internet connects five Mac mini nodes with fixed IPs 10.0.0.1 to 10.0.0.5. Node 1 is the head node and reaches the others over SSH. Qwen 14B runs across nodes 1 to 4 and Llama 3B on node 5."
      caption="Five M1 Mac minis on an isolated gigabit switch with fixed IPs and passwordless SSH from the head node. Qwen 14B runs across four nodes and Llama 3B on one, all through MLX."
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

function privacyLayout(width: number, sideInset: number, bands: number[], labels: (string | string[])[]): FlowLayout {
  // Each ring's label band is `bands[i]` tall; rings are inset `sideInset` per level and 16 at the bottom.
  const tops = bands.map((_, i) => 60 + bands.slice(0, i).reduce((sum, b) => sum + b, 0));
  const height = 60 + bands.reduce((sum, b) => sum + b, 0) + 16 * bands.length + 56;
  const layers = privacyLayers.map((_, i) => ({
    id: `layer${i + 1}`,
    x: 20 + i * sideInset,
    y: tops[i],
    w: width - 40 - 2 * i * sideInset,
    h: height - 16 - tops[i] - i * 16,
    label: labels[i],
    align: "start" as const,
    anchor: "top" as const,
    fill: i % 2 === 0 ? ("bg" as const) : ("surface" as const),
  }));
  const last = layers[layers.length - 1];
  const app = { id: "app", x: last.x + 14, y: last.y + last.h - 14 - 44, w: last.w - 28, h: 44, label: "Surplus AI", variant: "accent" as const };
  return {
    width,
    height,
    nodes: [{ id: "internet", x: width / 2 - 70, y: 8, w: 140, h: 34, label: "Internet", variant: "ghost" }, ...layers, app],
    edges: [],
    tracks: [{ nodes: ["app", "layer4", "layer3", "layer2", "layer1"] }],
  };
}

const surplusPrivacyWide = privacyLayout(920, 18, [40, 40, 40, 40], privacyLayers);
const surplusPrivacyNarrow = privacyLayout(300, 10, [40, 40, 74, 56], [
  "No uplink on the switch",
  "Wi-Fi off",
  ["HF_HUB_OFFLINE=1,", "so the model software", "can't download anything"],
  ["Model server only", "answers on localhost"],
]);

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

const watchtowerEdges: FlowLayout["edges"] = [
  ...flowEdges([
    ["input", "a1"],
    ["a1", "a2"],
    ["a2", "a3"],
    ["a3", "output"],
  ]),
  { from: "a2", to: "tool", dashed: true, arrow: false },
];
const watchtowerTracks: FlowLayout["tracks"] = [{ nodes: ["input", "a1", "a2", "tool", "a2", "a3", "output"] }];

const watchtowerWide: FlowLayout = {
  width: 1038,
  height: 290,
  nodes: [
    { id: "input", x: 16, y: 70, w: 150, h: 72, label: "Sales history", kicker: "Input", variant: "ghost" },
    { id: "a1", x: 200, y: 70, w: 190, h: 72, label: "Inventory Forecaster", kicker: "Agent 1" },
    { id: "a2", x: 424, y: 70, w: 190, h: 72, label: "Risk Analyst", kicker: "Agent 2" },
    { id: "tool", x: 424, y: 190, w: 190, h: 80, label: "RAG tool", kicker: "Tool", sub: ["ChromaDB,", "shipping-disruption data"], variant: "accent" },
    { id: "a3", x: 648, y: 70, w: 190, h: 72, label: "Logistics Coordinator", kicker: "Agent 3" },
    { id: "output", x: 872, y: 70, w: 150, h: 72, label: "Logistics plan", kicker: "Output", variant: "ghost" },
  ],
  edges: watchtowerEdges,
  tracks: watchtowerTracks,
};

const watchtowerNarrow: FlowLayout = {
  width: 300,
  height: 574,
  nodes: [
    { id: "input", x: 10, y: 10, w: 280, h: 60, label: "Sales history", kicker: "Input", variant: "ghost" },
    { id: "a1", x: 10, y: 100, w: 280, h: 64, label: "Inventory Forecaster", kicker: "Agent 1" },
    { id: "a2", x: 10, y: 194, w: 280, h: 64, label: "Risk Analyst", kicker: "Agent 2" },
    { id: "tool", x: 160, y: 288, w: 130, h: 96, label: "RAG tool", kicker: "Tool", sub: ["ChromaDB,", "shipping-", "disruption data"], variant: "accent" },
    { id: "a3", x: 10, y: 414, w: 280, h: 64, label: "Logistics Coordinator", kicker: "Agent 3" },
    { id: "output", x: 10, y: 508, w: 280, h: 56, label: "Logistics plan", kicker: "Output", variant: "ghost" },
  ],
  edges: watchtowerEdges,
  tracks: watchtowerTracks,
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
