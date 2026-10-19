import type { RoiFactors } from "@/core/demos/types";
const labels: Record<keyof RoiFactors, string> = {
  budget: "Budget value",
  competition: "Competition",
  credibility: "Client credibility",
  urgency: "Application urgency",
  differentiation: "Differentiation",
  effort: "Effort efficiency",
};
export function RoiBreakdown({ factors }: { factors: RoiFactors }) {
  return (
    <section className="rounded-2xl bg-surface p-5 shadow-card">
      <h2 className="font-semibold">ROI factors</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(factors).map(([factor, score]) => (
          <div className="rounded-xl border p-3" key={factor}>
            <p className="text-xs font-medium text-muted">
              {labels[factor as keyof RoiFactors]}
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums">
              {score === null ? "Unavailable" : `${score}/100`}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted">
        Unavailable information is excluded from the weighted score rather than
        treated as negative.
      </p>
    </section>
  );
}
