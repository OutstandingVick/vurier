import Link from "next/link";
import { BrainCircuit, SlidersHorizontal } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageShell } from "@/components/dashboard/page-shell";
import { AnalysisBatchForm } from "@/components/opportunities/analysis-batch-form";
import { BatchStatus } from "@/components/opportunities/batch-status";
import { RecommendationLegend } from "@/components/opportunities/recommendation-legend";
import { UsageSummary } from "@/components/opportunities/usage-summary";
import {
  OpportunityCard,
  type OpportunityCardAnalysis,
} from "@/components/opportunities/opportunity-card";
import { JOB_FEED_SELECT, toJobFeedItem } from "@/core/jobs/view-model";
import { hasDeepSeekEnv, hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

type Params = { recommendation?: string; sort?: string };
export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const params = await searchParams;
  const rows: Array<{
    job: ReturnType<typeof toJobFeedItem>;
    analysis: OpportunityCardAnalysis | null;
  }> = [];
  let activeRun: Record<string, unknown> | null = null;
  if (hasSupabaseEnv()) {
    const client = await createClient();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (user) {
      const [{ data: jobs }, { data: analyses }, { data: run }] =
        await Promise.all([
          client
            .from("jobs")
            .select(JOB_FEED_SELECT)
            .eq("user_id", user.id)
            .limit(100),
          client
            .from("job_analyses")
            .select(
              "id,job_id,overall_score,confidence_score,recommendation,factor_scores,strengths,estimated_cost_usd,created_at",
            )
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
          client
            .from("agent_runs")
            .select("id,status,metadata")
            .eq("user_id", user.id)
            .eq("run_type", "opportunity_analysis")
            .in("status", ["queued", "running"])
            .maybeSingle(),
        ]);
      activeRun = run;
      const latest = new Map<string, OpportunityCardAnalysis>();
      for (const item of analyses ?? [])
        if (!latest.has(item.job_id))
          latest.set(item.job_id, item as OpportunityCardAnalysis);
      for (const row of jobs ?? []) {
        const job = toJobFeedItem(row as Record<string, unknown>);
        if (job.state !== "hidden")
          rows.push({ job, analysis: latest.get(job.id) ?? null });
      }
    }
  }
  const filtered =
    params.recommendation && params.recommendation !== "all"
      ? rows.filter(
          (row) => row.analysis?.recommendation === params.recommendation,
        )
      : rows;
  filtered.sort((a, b) =>
    params.sort === "newest"
      ? Date.parse(b.job.published_at ?? b.job.retrieved_at) -
        Date.parse(a.job.published_at ?? a.job.retrieved_at)
      : (b.analysis?.overall_score ?? -1) - (a.analysis?.overall_score ?? -1),
  );
  return (
    <PageShell
      title="Opportunities"
      description="Ranked, evidence-based job matches"
    >
      <div className="space-y-6">
        <div className="grid gap-3 lg:grid-cols-2">
          <RecommendationLegend />
          <UsageSummary analyses={rows.filter((row) => row.analysis).length} estimatedCostUsd={rows.reduce((sum, row) => sum + Number(row.analysis?.estimated_cost_usd ?? 0), 0)} />
        </div>
        {activeRun ? <BatchStatus run={activeRun as { id: string; metadata: { total?: number; completed?: number; failed?: number } | null }} /> : null}
        <AnalysisBatchForm
          jobs={rows
            .slice(0, 25)
            .map(({ job, analysis }) => ({
              id: job.id,
              title: job.title,
              analyzed: Boolean(analysis),
            }))}
          disabledReason={
            !hasDeepSeekEnv()
              ? "DeepSeek is not configured. Add the API key in your server environment."
              : activeRun
                ? "An analysis batch is currently running."
                : rows.length === 0
                  ? "Save or discover jobs before starting an analysis."
                  : undefined
          }
        />
        <section
          className="rounded-2xl bg-surface p-4 shadow-card"
          aria-label="Opportunity filters"
        >
          <form className="flex flex-wrap items-end gap-3">
            <label className="space-y-1.5 text-sm font-medium">
              Recommendation
              <select
                className="field min-w-40"
                name="recommendation"
                defaultValue={params.recommendation ?? "all"}
              >
                <option value="all">All recommendations</option>
                <option value="apply">Apply</option>
                <option value="consider">Consider</option>
                <option value="skip">Skip</option>
              </select>
            </label>
            <label className="space-y-1.5 text-sm font-medium">
              Sort by
              <select
                className="field min-w-40"
                name="sort"
                defaultValue={params.sort ?? "score"}
              >
                <option value="score">Highest match</option>
                <option value="newest">Newest posting</option>
              </select>
            </label>
            <button className="button-secondary" type="submit">
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              Apply filters
            </button>
          </form>
        </section>
        {filtered.length ? (
          <section className="space-y-4" aria-label="Ranked opportunities">
            {filtered.map(({ job, analysis }) => (
              <OpportunityCard job={job} analysis={analysis} key={job.id} />
            ))}
          </section>
        ) : (
          <EmptyState
            icon={BrainCircuit}
            title="No opportunities match"
            description={
              rows.length
                ? "Adjust the recommendation filter to see more opportunities."
                : "Discover or manually import jobs, then return here to analyze their fit."
            }
            action={
              <Link className="button-secondary" href="/dashboard/discover">
                Discover jobs
              </Link>
            }
          />
        )}
      </div>
    </PageShell>
  );
}
