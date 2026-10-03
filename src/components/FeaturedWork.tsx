import { surplusAI, watchtower } from "@/content/portfolio";
import { AgentFlowDiagram, NetworkDiagram, PrivacyLayersDiagram, SurplusPipelineDiagram } from "./diagrams";
import { Section, TagList } from "./ui";

export function FeaturedWork() {
  return (
    <Section id="work" title="Featured work">
      <div className="space-y-24 md:space-y-32">
        <SurplusCaseStudy />
        <WatchtowerCaseStudy />
      </div>
    </Section>
  );
}

function CaseHeader({ id, title, tagline, meta }: { id: string; title: string; tagline: string; meta: string }) {
  return (
    <header className="max-w-[65ch]">
      <p className="font-mono text-xs tabular-nums text-muted">{meta}</p>
      <h3 id={id} className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink md:text-[32px] md:leading-tight">
        {title}
      </h3>
      <p className="mt-2 text-lg text-muted">{tagline}</p>
    </header>
  );
}

function Prose({ label, children }: { label: string; children: string }) {
  return (
    <div>
      <h4 className="font-medium text-ink">{label}</h4>
      <p className="mt-2 max-w-[65ch] leading-relaxed text-muted">{children}</p>
    </div>
  );
}

function StatusBadge({ state, children }: { state: "running" | "pending" | "neutral"; children: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-md border border-line px-2.5 py-1 text-sm text-ink">
      {state === "running" && <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent" />}
      {state === "pending" && <span aria-hidden="true" className="h-2 w-2 rounded-full border border-accent" />}
      {children}
    </span>
  );
}

function SurplusCaseStudy() {
  const s = surplusAI;
  return (
    <article aria-labelledby="surplus-heading" className="space-y-10 md:space-y-12">
      <CaseHeader id="surplus-heading" title={s.title} tagline={s.tagline} meta={`${s.date} · ${s.context}`} />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
        <Prose label="Problem">{s.problem}</Prose>
        <Prose label="What I built">{s.built}</Prose>
      </div>

      <SurplusPipelineDiagram />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <NetworkDiagram />
        </div>
        <div className="lg:col-span-5">
          <PrivacyLayersDiagram />
        </div>
      </div>

      <section aria-labelledby="surplus-how">
        <h4 id="surplus-how" className="mb-6 font-medium text-ink">
          How it works
        </h4>
        <dl className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {s.parts.map((p) => (
            <div key={p.name} className="border-t border-line pt-4">
              <dt className="font-medium text-ink">{p.name}</dt>
              <dd className="mt-2 text-[15px] leading-relaxed text-muted">{p.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="surplus-status" className="grid grid-cols-1 gap-6 border-t border-line pt-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h4 id="surplus-status" className="font-medium text-ink">
            Status
          </h4>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge state="running">{s.status.running}</StatusBadge>
            <StatusBadge state="pending">{s.status.pending}</StatusBadge>
          </div>
          <p className="mt-3 max-w-[65ch] leading-relaxed text-muted">{s.status.detail}</p>
        </div>
        <div className="lg:col-span-5">
          <h4 className="mb-3 font-medium text-ink">Stack</h4>
          <TagList items={s.stack} label="Surplus AI stack" />
        </div>
      </section>
    </article>
  );
}

function WatchtowerCaseStudy() {
  const w = watchtower;
  return (
    <article aria-labelledby="watchtower-heading" className="space-y-10 md:space-y-12">
      <CaseHeader id="watchtower-heading" title={w.title} tagline={w.tagline} meta={`${w.date} · ${w.context}`} />

      <AgentFlowDiagram />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-7">
          <Prose label="Problem">{w.problem}</Prose>
          <Prose label="What I built">{w.built}</Prose>
        </div>
        <div className="space-y-8 lg:col-span-5">
          <div>
            <h4 className="mb-3 font-medium text-ink">Status</h4>
            <StatusBadge state="neutral">{w.status}</StatusBadge>
          </div>
          <div>
            <h4 className="mb-3 font-medium text-ink">Stack</h4>
            <TagList items={w.stack} label="Watchtower stack" />
          </div>
        </div>
      </div>
    </article>
  );
}
