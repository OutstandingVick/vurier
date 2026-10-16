import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ShieldAlert,
  TriangleAlert,
} from "lucide-react";
import { PageShell } from "@/components/dashboard/page-shell";
import { AnalysisBatchForm } from "@/components/opportunities/analysis-batch-form";
import { AnalysisFactors } from "@/components/opportunities/analysis-factors";
import { FeedbackControls } from "@/components/opportunities/feedback-controls";
import { RecommendationBadge } from "@/components/opportunities/recommendation-badge";
import { ScoreRing } from "@/components/opportunities/score-ring";
import {
  DEFAULT_SCORING_WEIGHTS,
  type FactorAssessments,
  type Recommendation,
  type ScoringWeights,
} from "@/core/opportunities/types";
import { hasDeepSeekEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const instant = false;
export default async function OpportunityAnalysisPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) notFound();
  const [{ data: job }, { data: analysis }, { data: settings }] =
    await Promise.all([
      client
        .from("jobs")
        .select("id,title,description")
        .eq("id", jobId)
        .eq("user_id", user.id)
        .maybeSingle(),
      client
        .from("job_analyses")
        .select("*")
        .eq("job_id", jobId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      client
        .from("settings")
        .select("scoring_weights")
        .eq("user_id", user.id)
        .single(),
    ]);
  if (!job) notFound();
  const weights = (analysis?.scoring_weights ??
    settings?.scoring_weights ??
    DEFAULT_SCORING_WEIGHTS) as ScoringWeights;
  return (
    <PageShell
      title={job.title}
      description="Transparent opportunity intelligence"
    >
      <div className="space-y-6">
        <Link
          className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-muted outline-none hover:text-foreground focus-visible:rounded focus-visible:ring-2 focus-visible:ring-accent-strong"
          href="/dashboard/opportunities"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to opportunities
        </Link>
        {analysis ? (
          <>
            <section className="rounded-2xl bg-surface p-5 shadow-card sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <ScoreRing
                  score={analysis.overall_score}
                  confidence={analysis.confidence_score}
                />
                <div>
                  <RecommendationBadge
                    recommendation={analysis.recommendation as Recommendation}
                  />
                  <h2 className="mt-2 text-xl font-semibold">
                    {analysis.recommendation === "apply"
                      ? "Strong fit worth pursuing"
                      : analysis.recommendation === "consider"
                        ? "Promising, with tradeoffs"
                        : "Low fit based on available evidence"}
                  </h2>
                  <p className="mt-2 text-sm text-muted">
                    {analysis.confidence_score}% evidence coverage ·{" "}
                    {analysis.deep_model
                      ? "Deep evaluation"
                      : "Initial screening"}{" "}
                    · estimated $
                    {Number(analysis.estimated_cost_usd).toFixed(4)}
                  </p>
                </div>
              </div>
            </section>
            <AnalysisFactors
              factors={analysis.factor_scores as FactorAssessments}
              weights={weights}
            />
            <div className="grid gap-4 lg:grid-cols-3">
              <InsightList
                icon={CheckCircle2}
                title="Strengths"
                items={analysis.strengths as string[]}
              />
              <InsightList
                icon={TriangleAlert}
                title="Gaps"
                items={analysis.gaps as string[]}
              />
              <InsightList
                icon={ShieldAlert}
                title="Risks"
                items={analysis.risks as string[]}
              />
            </div>
            <section className="rounded-2xl bg-surface p-5 shadow-card">
              <h2 className="font-semibold">Suggested next steps</h2>
              <ol className="mt-3 list-decimal space-y-2 ps-5 text-sm leading-6">
                {(analysis.rationale as string[]).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </section>
            <FeedbackControls
              analysisId={analysis.id}
              feedback={analysis.feedback}
            />
            <AnalysisBatchForm
              jobs={[{ id: job.id, title: job.title, analyzed: true }]}
              disabledReason={
                !hasDeepSeekEnv() ? "DeepSeek is not configured." : undefined
              }
            />
          </>
        ) : (
          <AnalysisBatchForm
            jobs={[{ id: job.id, title: job.title, analyzed: false }]}
            disabledReason={
              !hasDeepSeekEnv()
                ? "DeepSeek is not configured. Add the API key in your server environment."
                : undefined
            }
          />
        )}
      </div>
    </PageShell>
  );
}
function InsightList({
  icon: Icon,
  title,
  items,
}: {
  icon: typeof CheckCircle2;
  title: string;
  items: string[];
}) {
  return (
    <section className="rounded-2xl border bg-surface p-5">
      <h2 className="flex items-center gap-2 font-semibold">
        <Icon className="size-4" aria-hidden="true" />
        {title}
      </h2>
      {items.length ? (
        <ul className="mt-3 list-disc space-y-2 ps-5 text-sm leading-6 text-muted">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted">
          No evidence-based {title.toLowerCase()} identified.
        </p>
      )}
    </section>
  );
}
