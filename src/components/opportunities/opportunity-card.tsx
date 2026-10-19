import Link from "next/link";
import { ArrowRight, CircleDollarSign } from "lucide-react";
import { formatBudget } from "@/core/jobs/format";
import type { JobFeedItem } from "@/core/jobs/view-model";
import type {
  FactorAssessments,
  Recommendation,
} from "@/core/opportunities/types";
import { RecommendationBadge } from "@/components/opportunities/recommendation-badge";
import { ScoreRing } from "@/components/opportunities/score-ring";

export type OpportunityCardAnalysis = {
  id: string;
  overall_score: number;
  confidence_score: number;
  recommendation: Recommendation;
  factor_scores: FactorAssessments;
  strengths: string[];
  estimated_cost_usd: number;
  created_at: string;
};
export function OpportunityCard({
  job,
  analysis,
}: {
  job: JobFeedItem;
  analysis: OpportunityCardAnalysis | null;
}) {
  return (
    <article className="rounded-2xl bg-surface p-5 shadow-card sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        {analysis ? (
          <ScoreRing
            score={analysis.overall_score}
            confidence={analysis.confidence_score}
          />
        ) : (
          <div className="grid size-20 shrink-0 place-items-center rounded-full border text-center text-xs font-medium text-muted">
            Not
            <br />
            analyzed
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {analysis ? (
              <RecommendationBadge recommendation={analysis.recommendation} />
            ) : null}
            <span className="inline-flex items-center gap-1 text-sm font-medium">
              <CircleDollarSign className="size-4" aria-hidden="true" />
              {formatBudget(job)}
            </span>
          </div>
          <h2 className="mt-2 text-balance text-lg font-semibold tracking-[-0.02em]">
            <Link
              className="outline-none hover:underline focus-visible:rounded focus-visible:ring-2 focus-visible:ring-accent-strong"
              href={`/dashboard/opportunities/${job.id}`}
            >
              {job.title}
            </Link>
          </h2>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
            {job.description}
          </p>
          {analysis?.strengths?.length ? (
            <p className="mt-3 text-sm">
              <span className="font-semibold">Top strength:</span>{" "}
              {analysis.strengths[0]}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-muted">
              {analysis
                ? `${analysis.confidence_score}% evidence coverage · est. $${Number(analysis.estimated_cost_usd).toFixed(4)}`
                : "Analyze to get a transparent match score"}
            </span>
            <Link
              className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold outline-none hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-accent-strong"
              href={`/dashboard/opportunities/${job.id}`}
            >
              View analysis <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
