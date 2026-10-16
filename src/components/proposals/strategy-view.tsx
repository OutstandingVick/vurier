import type { ProposalStrategy } from "@/core/proposals/types";
export function StrategyView({ strategy }: { strategy: ProposalStrategy }) {
  return (
    <section className="space-y-4" aria-labelledby="strategy-heading">
      <div>
        <h2 id="strategy-heading" className="text-lg font-semibold">
          Proposal strategy
        </h2>
        <p className="mt-1 text-sm text-muted">
          AI recommendation grounded in the job and selected evidence.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Box title="Client problem" items={[strategy.clientProblem]} />
        <Box title="Expected deliverables" items={strategy.deliverables} />
        <Box title="Priorities" items={strategy.priorities} />
        <Box title="Risks" items={strategy.risks} />
        <Box title="How to stand out" items={strategy.differentiation} />
        <Box title="Positioning" items={[strategy.positioning]} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Box
          title="Suggested bid · estimate"
          items={[
            strategy.suggestedBid.amount === null
              ? "Insufficient information for a numeric estimate."
              : `${strategy.suggestedBid.currency} ${strategy.suggestedBid.amount.toLocaleString()}`,
            strategy.suggestedBid.basis,
          ]}
        />
        <Box
          title="Timeline · estimate"
          items={[strategy.timeline.value, strategy.timeline.basis]}
        />
      </div>
      <Box
        title="Proof-of-work recommendation"
        items={
          strategy.demo.recommended
            ? [
                strategy.demo.type ?? "Targeted sample",
                strategy.demo.scope ?? "Scope unavailable",
                `Estimated effort: ${strategy.demo.effort ?? "unavailable"}`,
                strategy.demo.expectedValue ?? "Expected value unavailable",
                ...strategy.demo.references.map((ref) => `Reference: ${ref}`),
              ]
            : ["A custom demo is not justified for this opportunity."]
        }
      />
    </section>
  );
}
function Box({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="rounded-2xl border bg-surface p-5">
      <h3 className="font-semibold">{title}</h3>
      <ul className="mt-2 list-disc space-y-1 ps-5 text-sm leading-6 text-muted">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}
