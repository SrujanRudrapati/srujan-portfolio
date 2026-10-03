import { ArrowRightIcon, XIcon } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";
import { surplusAI, watchtower } from "@/content/portfolio";

// Diagrams are built from semantic HTML lists, so they reflow on phones and
// read in order for screen readers. Arrows are decorative.

function Panel({ caption, children, className = "" }: { caption: string; children: ReactNode; className?: string }) {
  return (
    <figure className={`reveal rounded-xl bg-raised p-5 md:p-8 ${className}`}>
      {children}
      <figcaption className="mt-6 max-w-[65ch] text-sm leading-relaxed text-muted">{caption}</figcaption>
    </figure>
  );
}

function Node({
  name,
  detail,
  kicker,
  variant = "solid",
}: {
  name: string;
  detail?: string;
  kicker?: string;
  variant?: "solid" | "accent" | "ghost";
}) {
  const border =
    variant === "accent" ? "border-accent" : variant === "ghost" ? "border-dashed border-line" : "border-line";
  return (
    <div className={`h-full rounded-md border bg-bg px-3 py-3 ${border}`}>
      {kicker && <p className="font-mono text-[11px] text-muted">{kicker}</p>}
      <p className={`font-display text-[15px] font-medium leading-snug ${variant === "ghost" ? "text-muted" : "text-ink"}`}>
        {name}
      </p>
      {detail && <p className="mt-1 text-[13px] leading-snug text-muted">{detail}</p>}
    </div>
  );
}

function Arrow({ className = "" }: { className?: string }) {
  return (
    <li aria-hidden="true" className={`flex shrink-0 justify-center text-accent ${className}`}>
      <ArrowRightIcon size={18} weight="bold" className="rotate-90 lg:rotate-0" />
    </li>
  );
}

export function SurplusPipelineDiagram() {
  const { inputs, steps } = surplusAI.pipeline;
  return (
    <Panel caption="How a Mac goes from the shelf to a listing. Working Macs report their own specs; Macs that won't boot get their label scanned. Both land in one inventory keyed on serial number.">
      <ol aria-label="Surplus AI pipeline" className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
        <li className="lg:w-[22%] lg:shrink-0">
          <ul aria-label="Spec sources" className="grid grid-cols-2 gap-2 lg:grid-cols-1">
            {inputs.map((i) => (
              <li key={i.name}>
                <Node name={i.name} detail={i.detail} />
              </li>
            ))}
          </ul>
        </li>
        {steps.map((s) => (
          <StepWithArrow key={s.name}>
            <Node name={s.name} detail={s.detail} variant={s.name === "LLM" ? "accent" : "solid"} />
          </StepWithArrow>
        ))}
      </ol>
    </Panel>
  );
}

function StepWithArrow({ children }: { children: ReactNode }) {
  return (
    <>
      <Arrow />
      <li className="lg:min-w-0 lg:flex-1">{children}</li>
    </>
  );
}

export function NetworkDiagram() {
  return (
    <Panel caption="Five M1 Mac minis on an isolated gigabit switch with fixed IPs and passwordless SSH from the head node. Nodes 2 through 4 are still receiving the 14B model files.">
      <div aria-label="Cluster network" role="group">
        <div className="flex flex-col items-center">
          <div className="rounded-md border border-dashed border-line px-3 py-1.5 font-mono text-xs text-muted">Internet</div>
          <div className="relative flex h-10 items-center">
            <span aria-hidden="true" className="h-full border-l border-dashed border-line" />
            <span className="absolute left-3 flex items-center gap-1 font-mono text-[11px] whitespace-nowrap text-accent">
              <XIcon aria-hidden="true" size={12} weight="bold" />
              No uplink
            </span>
          </div>
          <div className="w-full rounded-md border border-accent bg-bg py-2 text-center font-display text-[15px] font-medium text-ink">
            Gigabit switch
          </div>
        </div>

        <ul aria-label="Cluster nodes" className="grid grid-cols-5 gap-1.5 sm:gap-3">
          {surplusAI.nodes.map((n, i) => (
            <li key={n.ip} className="flex flex-col items-center">
              <span aria-hidden="true" className="h-5 border-l border-line" />
              <div className="w-full rounded-md border border-line bg-bg px-1 py-2.5 text-center">
                <p className="font-display text-sm font-medium text-ink">Node {i + 1}</p>
                <p className="mt-0.5 font-mono text-[10px] tabular-nums text-muted sm:text-[11px]">{n.ip}</p>
                <p className="mt-1.5 flex h-4 items-center justify-center gap-1 text-[11px] text-muted">
                  {n.role && <span>{n.role.replace(" node", "")}</span>}
                  {n.pending && (
                    <>
                      <span aria-hidden="true" className="h-2 w-2 rounded-full border border-accent" />
                      <span className="sr-only">14B model files still copying</span>
                    </>
                  )}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex items-center gap-2 text-xs text-muted">
          <span aria-hidden="true" className="h-2 w-2 rounded-full border border-accent" />
          14B model files still copying
        </p>
      </div>
    </Panel>
  );
}

export function PrivacyLayersDiagram() {
  const layers = surplusAI.privacyLayers;
  const radius = ["rounded-xl", "rounded-lg", "rounded-lg", "rounded-md"];

  const render = (i: number): ReactNode =>
    i === layers.length ? (
      <div className="rounded-md border border-accent bg-bg px-3 py-3 text-center font-display text-[15px] font-medium text-ink">
        Surplus AI
      </div>
    ) : (
      <div className={`border border-line p-2.5 sm:p-3 ${radius[i]} ${i % 2 === 0 ? "bg-bg" : "bg-raised"}`}>
        <p className="mb-2.5 px-0.5 font-mono text-[11px] leading-snug text-muted">{layers[i]}</p>
        {render(i + 1)}
      </div>
    );

  return (
    <Panel caption={`Four layers sit between the model and the internet. ${surplusAI.privacyNote}`}>
      <div role="group" aria-label="Privacy layers, outermost first">{render(0)}</div>
    </Panel>
  );
}

export function AgentFlowDiagram() {
  const [forecaster, analyst, coordinator] = watchtower.agents;
  return (
    <Panel caption="Three agents run in sequence, each consuming the previous agent's output. Only the Risk Analyst has a tool: retrieval over real shipping-disruption data in ChromaDB.">
      <ol aria-label="Watchtower agent flow" className="flex flex-col gap-2 lg:flex-row lg:items-start lg:gap-3">
        <li className="lg:min-w-0 lg:flex-1">
          <Node name={watchtower.input} variant="ghost" kicker="Input" />
        </li>
        <Arrow className="lg:mt-7" />
        <li className="lg:min-w-0 lg:flex-1">
          <Node name={forecaster} kicker="Agent 1" />
        </li>
        <Arrow className="lg:mt-7" />
        <li className="lg:min-w-0 lg:flex-1">
          <Node name={analyst} kicker="Agent 2" />
          <div className="flex justify-center" aria-hidden="true">
            <span className="h-5 border-l border-dashed border-accent" />
          </div>
          <Node name={watchtower.tool.name} detail={watchtower.tool.detail} variant="accent" kicker="Tool" />
        </li>
        <Arrow className="lg:mt-7" />
        <li className="lg:min-w-0 lg:flex-1">
          <Node name={coordinator} kicker="Agent 3" />
        </li>
        <Arrow className="lg:mt-7" />
        <li className="lg:min-w-0 lg:flex-1">
          <Node name={watchtower.output} variant="ghost" kicker="Output" />
        </li>
      </ol>
    </Panel>
  );
}
