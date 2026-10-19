import { BarChart3 } from "lucide-react";
import { connection } from "next/server";
import { AnalyticsFilters } from "@/components/analytics/analytics-filters";
import { CostMonitor } from "@/components/analytics/cost-monitor";
import { ExpenseForm } from "@/components/analytics/expense-form";
import { FunnelChart } from "@/components/analytics/funnel-chart";
import { MetricCard } from "@/components/analytics/metric-card";
import { OptimizationPanel } from "@/components/analytics/optimization-panel";
import { ReliabilityPanel } from "@/components/analytics/reliability-panel";
import { RoiPanel } from "@/components/analytics/roi-panel";
import { StrategyTable } from "@/components/analytics/strategy-table";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageShell } from "@/components/dashboard/page-shell";
import { loadAnalytics, resolveDateWindow } from "@/core/analytics";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
export const instant = false;
export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; category?: string }>;
}) {
  await connection();
  const filters = await searchParams;
  const window = resolveDateWindow(filters.range);
  const category = filters.category ?? "all";
  let data: Awaited<ReturnType<typeof loadAnalytics>> | null = null;
  let adjustments: Array<{
    id: string;
    factor: string;
    adjustment: number;
    sample_size: number;
    explanation: string;
  }> = [];
  let optimizationEnabled = false;
  if (hasSupabaseEnv()) {
    const client = await createClient();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (user) {
      const [loaded, adjustmentResult, settingsResult] = await Promise.all([
        loadAnalytics(client, user.id, window, category),
        client
          .from("ranking_adjustments")
          .select("id,factor,adjustment,sample_size,explanation")
          .eq("user_id", user.id)
          .eq("active", true)
          .order("created_at", { ascending: false }),
        client
          .from("settings")
          .select("feedback_optimization_enabled")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);
      data = loaded;
      adjustments = adjustmentResult.data ?? [];
      optimizationEnabled =
        settingsResult.data?.feedback_optimization_enabled ?? false;
    }
  }
  return (
    <PageShell
      title="Analytics"
      description="Contracts won per Connect spent, grounded in recorded outcomes"
    >
      <div className="space-y-6">
        <AnalyticsFilters
          range={window.key}
          category={category}
          categories={data?.categories ?? []}
        />
        {data &&
        (data.metrics.discovered.value ||
          data.sample.applications ||
          data.sample.proposals) ? (
          <>
            <section
              className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
              aria-label="Performance metrics"
            >
              <MetricCard
                label="Jobs discovered"
                metric={data.metrics.discovered}
              />
              <MetricCard
                label="Qualified opportunities"
                metric={data.metrics.qualified}
              />
              <MetricCard
                label="Proposals generated"
                metric={data.metrics.proposals}
              />
              <MetricCard
                label="Applications submitted"
                metric={data.metrics.submitted}
              />
              <MetricCard label="Interviews" metric={data.metrics.interviews} />
              <MetricCard label="Hires" metric={data.metrics.hires} />
            </section>
            <FunnelChart points={data.funnel} />
            <div className="grid gap-6 xl:grid-cols-2">
              <RoiPanel roi={data.roi} />
              <CostMonitor costs={data.costs} />
            </div>
            <StrategyTable
              title="Performance by category"
              rows={data.strategies.categories}
            />
            <StrategyTable
              title="Custom demo association"
              rows={data.strategies.demos}
            />
            <div className="grid gap-6 xl:grid-cols-2">
              <StrategyTable
                title="Proposal style association"
                rows={data.strategies.proposalStyles}
              />
              <StrategyTable
                title="Bid range association"
                rows={data.strategies.bidRanges}
              />
              <StrategyTable
                title="Portfolio attachment association"
                rows={data.strategies.attachments}
              />
              <StrategyTable
                title="AI recommendation association"
                rows={data.strategies.recommendations}
              />
            </div>
            <OptimizationPanel
              enabled={optimizationEnabled}
              adjustments={adjustments}
            />
            <div className="grid gap-6 xl:grid-cols-2">
              <ReliabilityPanel reliability={data.reliability} />
              <ExpenseForm />
            </div>
          </>
        ) : (
          <>
            <EmptyState
              icon={BarChart3}
              title="Not enough historical data yet"
              description="Discover jobs, record application outcomes, and add real expenses to build an evidence-based performance view."
            />
            <div className="grid gap-6 xl:grid-cols-2">
              <OptimizationPanel
                enabled={optimizationEnabled}
                adjustments={adjustments}
              />
              <ExpenseForm />
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}
