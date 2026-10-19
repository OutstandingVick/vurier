import type { SupabaseClient } from "@supabase/supabase-js";
import { buildFunnel } from "./funnel";
import { inWindow, comparison } from "./date-range";
import { calculateApplicationRoi } from "./roi";
import { summarizeCosts } from "./costs";
import { compareStrategies } from "./strategy";
import { reliabilitySummary } from "./reliability";
import type { ApplicationAnalyticsRow, CostEntry, DateWindow } from "./types";

type RawApplication = Record<string, unknown> & {
  jobs?: { category?: string | null } | null;
};
function num(value: unknown) {
  return value === null || value === undefined ? null : Number(value);
}
function appRow(row: RawApplication): ApplicationAnalyticsRow {
  return {
    id: String(row.id),
    jobId: row.job_id ? String(row.job_id) : null,
    status: String(row.status),
    createdAt: String(row.created_at),
    submittedAt: row.submitted_at ? String(row.submitted_at) : null,
    bidAmount: num(row.bid_amount),
    connectsCost: num(row.connects_cost),
    boostConnects: Number(row.boost_connects ?? 0),
    earnings: num(row.earnings),
    earningsConfirmed: Boolean(row.earnings_confirmed),
    timeInvestedMinutes: num(row.time_invested_minutes),
    timeConfirmed: Boolean(row.time_confirmed),
  };
}
function filterCategory<
  T extends { jobs?: { category?: string | null } | null },
>(rows: T[], category?: string) {
  return category && category !== "all"
    ? rows.filter((row) => row.jobs?.category === category)
    : rows;
}

export async function loadAnalytics(
  client: SupabaseClient,
  userId: string,
  window: DateWindow,
  category?: string,
) {
  const since = window.previousFrom.toISOString();
  const [
    { data: jobs },
    { data: analyses },
    { data: proposals },
    { data: rawApplications },
    { data: strategyCosts },
    { data: demoCosts },
    { data: runs },
    { data: expenses },
    { data: settings },
    { data: attempts },
    { data: errors },
    { data: health },
    { data: demoLinks },
    { data: statusHistory },
    { data: proposalVersions },
  ] = await Promise.all([
    client
      .from("jobs")
      .select("id,category,created_at")
      .eq("user_id", userId)
      .gte("created_at", since),
    client
      .from("job_analyses")
      .select(
        "id,job_id,recommendation,overall_score,screening_model,deep_model,estimated_cost_usd,created_at,jobs(category)",
      )
      .eq("user_id", userId)
      .gte("created_at", since),
    client
      .from("proposals")
      .select("id,job_id,attachment_ids,created_at,jobs(category)")
      .eq("user_id", userId)
      .gte("created_at", since),
    client
      .from("applications")
      .select("*,jobs(category)")
      .eq("user_id", userId)
      .gte("created_at", since),
    client
      .from("proposal_strategies")
      .select("model,estimated_cost_usd,created_at")
      .eq("user_id", userId)
      .gte("created_at", since),
    client
      .from("demo_strategies")
      .select("strategy_model,artifact_model,estimated_cost_usd,created_at")
      .eq("user_id", userId)
      .gte("created_at", since),
    client
      .from("monitoring_runs")
      .select("status,estimated_cost_usd,started_at")
      .eq("user_id", userId)
      .gte("started_at", since),
    client
      .from("external_expenses")
      .select("category,provider,amount_usd,estimated,incurred_at")
      .eq("user_id", userId)
      .gte("incurred_at", since),
    client
      .from("settings")
      .select(
        "monthly_ai_budget_usd,monthly_research_budget_usd,connects_usd_rate",
      )
      .eq("user_id", userId)
      .maybeSingle(),
    client.from("submission_attempts").select("status").eq("user_id", userId),
    client
      .from("monitoring_errors")
      .select("created_at")
      .eq("user_id", userId)
      .gte("created_at", new Date(Date.now() - 7 * 86_400_000).toISOString()),
    client
      .from("integration_health")
      .select("integration,status,detail")
      .eq("user_id", userId),
    client
      .from("proposal_demo_assets")
      .select("proposal_id")
      .eq("user_id", userId),
    client
      .from("application_status_history")
      .select("application_id,to_status,created_at")
      .eq("user_id", userId)
      .gte("created_at", since),
    client
      .from("proposal_versions")
      .select("proposal_id,tone,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5000),
  ]);
  const selectedJobs =
    category && category !== "all"
      ? (jobs ?? []).filter((row) => row.category === category)
      : (jobs ?? []);
  const selectedAnalyses = filterCategory(
    (analyses ?? []) as Array<
      Record<string, unknown> & { jobs?: { category?: string | null } | null }
    >,
    category,
  );
  const selectedProposals = filterCategory(
    (proposals ?? []) as Array<
      Record<string, unknown> & { jobs?: { category?: string | null } | null }
    >,
    category,
  );
  const applications = filterCategory(
    (rawApplications ?? []) as RawApplication[],
    category,
  );
  const buildPeriod = (from: Date, to: Date) => {
    const periodJobs = selectedJobs.filter((row) =>
      inWindow(row.created_at, from, to),
    );
    const periodAnalyses = selectedAnalyses.filter((row) =>
      inWindow(String(row.created_at), from, to),
    );
    const qualifiedJobIds = new Set(
      periodAnalyses
        .filter((row) =>
          ["apply", "consider"].includes(String(row.recommendation)),
        )
        .map((row) => String(row.job_id)),
    );
    const periodProposals = selectedProposals.filter((row) =>
      inWindow(String(row.created_at), from, to),
    );
    const periodAppsRaw = applications.filter((row) =>
      inWindow(
        row.submitted_at ? String(row.submitted_at) : String(row.created_at),
        from,
        to,
      ),
    );
    const periodApps = periodAppsRaw.map(appRow);
    const histories = new Map<string, string[]>();
    for (const item of statusHistory ?? [])
      histories.set(item.application_id, [
        ...(histories.get(item.application_id) ?? []),
        item.to_status,
      ]);
    return {
      jobs: periodJobs.length,
      qualified: qualifiedJobIds.size,
      proposals: periodProposals.length,
      applications: periodApps,
      funnel: buildFunnel({
        discovered: periodJobs.length,
        qualified: qualifiedJobIds.size,
        proposals: periodProposals.length,
        statuses: periodApps.map((row) => row.status),
        journeys: periodApps.map((row) => [
          row.status,
          ...(histories.get(row.id) ?? []),
        ]),
      }),
    };
  };
  const current = buildPeriod(window.from, window.to);
  const previous = buildPeriod(window.previousFrom, window.previousTo);
  const aiCosts: CostEntry[] = [
    ...selectedAnalyses.map((row) => ({
      source: "deepseek" as const,
      model: String(row.deep_model ?? row.screening_model ?? "unknown"),
      amountUsd: Number(row.estimated_cost_usd ?? 0),
      estimated: true,
      occurredAt: String(row.created_at),
    })),
    ...(strategyCosts ?? []).map((row) => ({
      source: "deepseek" as const,
      model: row.model,
      amountUsd: Number(row.estimated_cost_usd ?? 0),
      estimated: true,
      occurredAt: row.created_at,
    })),
    ...(demoCosts ?? []).map((row) => ({
      source: "deepseek" as const,
      model: `${row.strategy_model}+${row.artifact_model}`,
      amountUsd: Number(row.estimated_cost_usd ?? 0),
      estimated: true,
      occurredAt: row.created_at,
    })),
    ...(expenses ?? []).map((row) => ({
      source: "research" as const,
      model: row.provider,
      amountUsd: Number(row.amount_usd ?? 0),
      estimated: row.estimated,
      occurredAt: row.incurred_at,
    })),
  ].filter((entry) => inWindow(entry.occurredAt, window.from, window.to));
  const currentProposalIds = new Set(
    selectedProposals
      .filter((row) => inWindow(String(row.created_at), window.from, window.to))
      .map((row) => String(row.id)),
  );
  const demoProposalIds = new Set(
    (demoLinks ?? []).map((row) => row.proposal_id),
  );
  const categoryRows = applications
    .filter((row) =>
      inWindow(
        row.submitted_at ? String(row.submitted_at) : String(row.created_at),
        window.from,
        window.to,
      ),
    )
    .map((row) => ({
      dimension: row.jobs?.category ?? null,
      status: String(row.status),
      earnings: num(row.earnings),
    }));
  const currentRawApplications = applications.filter((row) =>
    inWindow(
      row.submitted_at ? String(row.submitted_at) : String(row.created_at),
      window.from,
      window.to,
    ),
  );
  const tones = new Map<string, string>();
  for (const version of proposalVersions ?? [])
    if (!tones.has(version.proposal_id))
      tones.set(version.proposal_id, version.tone ?? "unavailable");
  const recommendationByJob = new Map<string, string>();
  for (const analysis of selectedAnalyses
    .slice()
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))))
    if (!recommendationByJob.has(String(analysis.job_id)))
      recommendationByJob.set(
        String(analysis.job_id),
        String(analysis.recommendation ?? "unavailable"),
      );
  const proposalById = new Map(
    selectedProposals.map((proposal) => [String(proposal.id), proposal]),
  );
  const outcomeRows = (dimension: (row: RawApplication) => string | null) =>
    currentRawApplications.map((row) => ({
      dimension: dimension(row),
      status: String(row.status),
      earnings: num(row.earnings),
    }));
  const demoRows = applications
    .filter((row) =>
      inWindow(
        row.submitted_at ? String(row.submitted_at) : String(row.created_at),
        window.from,
        window.to,
      ),
    )
    .map((row) => ({
      dimension: demoProposalIds.has(String(row.proposal_id))
        ? "with_demo"
        : "without_demo",
      status: String(row.status),
      earnings: num(row.earnings),
    }));
  const monthBudget =
    Number(settings?.monthly_ai_budget_usd ?? 10) +
    Number(settings?.monthly_research_budget_usd ?? 0);
  return {
    metrics: {
      discovered: comparison(current.jobs, previous.jobs),
      qualified: comparison(current.qualified, previous.qualified),
      proposals: comparison(current.proposals, previous.proposals),
      submitted: comparison(current.funnel[3].count, previous.funnel[3].count),
      interviews: comparison(current.funnel[5].count, previous.funnel[5].count),
      hires: comparison(current.funnel[6].count, previous.funnel[6].count),
    },
    funnel: current.funnel,
    roi: calculateApplicationRoi(
      current.applications,
      aiCosts,
      Number(settings?.connects_usd_rate ?? 0.15),
    ),
    costs: summarizeCosts(aiCosts, monthBudget),
    strategies: {
      categories: compareStrategies(categoryRows),
      demos: compareStrategies(demoRows, {
        with_demo: "With approved demo",
        without_demo: "Without demo",
      }),
      proposalStyles: compareStrategies(
        outcomeRows((row) => tones.get(String(row.proposal_id)) ?? null),
      ),
      bidRanges: compareStrategies(
        outcomeRows((row) => {
          const bid = num(row.bid_amount);
          return bid === null
            ? null
            : bid < 500
              ? "under_500"
              : bid < 2000
                ? "500_to_1999"
                : "2000_plus";
        }),
        {
          under_500: "Under $500",
          "500_to_1999": "$500–$1,999",
          "2000_plus": "$2,000+",
        },
      ),
      attachments: compareStrategies(
        outcomeRows((row) =>
          ((proposalById.get(String(row.proposal_id))?.attachment_ids as
            | string[]
            | undefined)?.length ?? 0) > 0
            ? "with_attachment"
            : "without_attachment",
        ),
        {
          with_attachment: "With portfolio attachment",
          without_attachment: "Without portfolio attachment",
        },
      ),
      recommendations: compareStrategies(
        outcomeRows(
          (row) => recommendationByJob.get(String(row.job_id)) ?? null,
        ),
      ),
    },
    reliability: reliabilitySummary({
      runs: runs ?? [],
      attempts: attempts ?? [],
      errors: errors ?? [],
      integrations: (health ?? []).map((row) => ({
        name: row.integration,
        status: row.status,
        detail: row.detail,
      })),
    }),
    categories: [
      ...new Set((jobs ?? []).map((row) => row.category).filter(Boolean)),
    ].sort(),
    sample: {
      applications: current.applications.length,
      proposals: currentProposalIds.size,
    },
  };
}
