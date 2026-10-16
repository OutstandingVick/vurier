import {
  SCORE_FACTORS,
  type FactorAssessments,
  type ScoringWeights,
} from "@/core/opportunities/types";
import { FACTOR_LABELS } from "@/core/opportunities/factor-labels";
export function AnalysisFactors({
  factors,
  weights,
}: {
  factors: FactorAssessments;
  weights: ScoringWeights;
}) {
  return (
    <section aria-labelledby="factor-heading">
      <h2 id="factor-heading" className="text-lg font-semibold">
        Scoring breakdown
      </h2>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {SCORE_FACTORS.map((key) => {
          const factor = factors[key];
          return (
            <article className="rounded-2xl border bg-surface p-4" key={key}>
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold">{FACTOR_LABELS[key]}</h3>
                <span className="text-sm font-semibold tabular-nums">
                  {factor.score === null
                    ? "Unavailable"
                    : `${factor.score}/100`}{" "}
                  · {weights[key]}%
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted">
                {factor.explanation}
              </p>
              {factor.evidence.length ? (
                <ul className="mt-3 list-disc space-y-1 ps-5 text-sm">
                  {factor.evidence.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-xs font-medium text-muted">
                  {factor.unavailableReason ??
                    "No supporting evidence supplied."}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
