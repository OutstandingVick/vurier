import { ConnectionStatus } from "@/components/settings/connection-status";
import { UpworkConnection } from "@/components/settings/upwork-connection";
import { SettingsForm } from "@/components/settings/settings-form";
import { PageShell } from "@/components/dashboard/page-shell";
import { hasDeepSeekEnv, hasSupabaseEnv, hasUpworkEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function SettingsPage() {
  const fallback = {
    displayName: "",
    headline: "",
    bio: "",
    verifiedSkills: [] as string[],
    categories: ["Frontend Development", "Web3 & Fintech", "Technical Writing"],
    minimumFixedBudget: null,
    minimumHourlyRate: null,
    maximumConnects: null,
    model: "deepseek-flash",
    reasoning: "medium",
    scoringWeights: {
      skillMatch: 30,
      portfolioRelevance: 20,
      budgetValue: 15,
      competition: 15,
      clientCredibility: 10,
      recency: 10,
    },
    dailyAnalysisLimit: 25,
    monthlyAiBudgetUsd: 10,
    dailyConnectsLimit: 40,
    monthlyConnectsLimit: 200,
  };
  let initial = fallback;
  let upworkStatus: string | undefined;
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const [{ data: profile }, { data: settings }] = await Promise.all([
        supabase
          .from("profiles")
          .select("display_name,headline,bio,verified_skills")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("settings")
          .select(
            "preferred_categories,minimum_fixed_budget,minimum_hourly_rate,maximum_connects_per_job,preferred_model,reasoning_effort,scoring_weights,daily_analysis_limit,monthly_ai_budget_usd,daily_connects_limit,monthly_connects_limit",
          )
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);
      const { data: upwork } = await supabase
        .from("discovery_sources")
        .select("status")
        .eq("user_id", user.id)
        .eq("provider", "upwork_api")
        .maybeSingle();
      upworkStatus = upwork?.status;
      initial = {
        displayName: profile?.display_name ?? "",
        headline: profile?.headline ?? "",
        bio: profile?.bio ?? "",
        verifiedSkills: profile?.verified_skills ?? [],
        categories: settings?.preferred_categories ?? fallback.categories,
        minimumFixedBudget: settings?.minimum_fixed_budget ?? null,
        minimumHourlyRate: settings?.minimum_hourly_rate ?? null,
        maximumConnects: settings?.maximum_connects_per_job ?? null,
        model: settings?.preferred_model ?? fallback.model,
        reasoning: settings?.reasoning_effort ?? fallback.reasoning,
        scoringWeights: settings?.scoring_weights ?? fallback.scoringWeights,
        dailyAnalysisLimit:
          settings?.daily_analysis_limit ?? fallback.dailyAnalysisLimit,
        monthlyAiBudgetUsd: Number(
          settings?.monthly_ai_budget_usd ?? fallback.monthlyAiBudgetUsd,
        ),
        dailyConnectsLimit:
          settings?.daily_connects_limit ?? fallback.dailyConnectsLimit,
        monthlyConnectsLimit:
          settings?.monthly_connects_limit ?? fallback.monthlyConnectsLimit,
      };
    }
  }
  return (
    <PageShell
      title="Settings"
      description="Profile, opportunity preferences, and connections"
    >
      <div className="mb-6 rounded-2xl bg-surface p-5 shadow-card sm:p-6">
        <h2 className="text-lg font-semibold tracking-[-0.02em]">
          Connection status
        </h2>
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          <ConnectionStatus
            label="Supabase"
            configured={hasSupabaseEnv()}
            description="Authentication and database connection."
          />
          <ConnectionStatus
            label="DeepSeek"
            configured={hasDeepSeekEnv()}
            description="Server-side AI model access."
          />
        </div>
      </div>
      <div className="mb-6">
        <UpworkConnection
          configured={hasUpworkEnv()}
          connected={upworkStatus === "connected"}
          status={upworkStatus}
        />
      </div>
      <div className="mb-6 rounded-2xl bg-surface p-5 shadow-card sm:p-6">
        <h2 className="text-lg font-semibold tracking-[-0.02em]">
          Monitoring and alerts
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Configure authorized job monitoring, AI budgets, quiet hours, and
          Telegram delivery in the monitoring workspace.
        </p>
        <Link className="button-secondary mt-4" href="/dashboard/monitoring">
          Open monitoring settings
        </Link>
      </div>
      <SettingsForm initial={initial} />
    </PageShell>
  );
}
