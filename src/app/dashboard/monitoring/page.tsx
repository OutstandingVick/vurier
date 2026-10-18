import { ActivitySummary } from "@/components/monitoring/activity-summary";
import { MonitoringSettingsForm } from "@/components/monitoring/monitoring-settings-form";
import { RunHistory } from "@/components/monitoring/run-history";
import { PageShell } from "@/components/dashboard/page-shell";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";

export const instant = false;
export default async function MonitoringPage() {
  let schedule: Record<string, unknown> | null = null,
    preferences: Record<string, unknown> | null = null,
    settings: Record<string, unknown> | null = null,
    runs: Array<Record<string, unknown>> = [];
  if (hasSupabaseEnv()) {
    const client = await createClient();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (user) {
      const results = await Promise.all([
        client
          .from("monitoring_schedules")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle(),
        client
          .from("notification_preferences")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle(),
        client
          .from("settings")
          .select("daily_ai_budget_usd")
          .eq("user_id", user.id)
          .maybeSingle(),
        client
          .from("monitoring_runs")
          .select("*")
          .eq("user_id", user.id)
          .order("started_at", { ascending: false })
          .limit(20),
      ]);
      schedule = results[0].data;
      preferences = results[1].data;
      settings = results[2].data;
      runs = results[3].data ?? [];
    }
  }
  const totals = runs.reduce<{
    runs: number;
    discovered: number;
    analyzed: number;
    delivered: number;
    failures: number;
  }>(
    (sum, run) => ({
      runs: sum.runs + 1,
      discovered: sum.discovered + Number(run.jobs_discovered ?? 0),
      analyzed: sum.analyzed + Number(run.opportunities_analyzed ?? 0),
      delivered: sum.delivered + Number(run.notifications_delivered ?? 0),
      failures: sum.failures + Number(run.failures ?? 0),
    }),
    { runs: 0, discovered: 0, analyzed: 0, delivered: 0, failures: 0 },
  );
  const initial = {
    enabled: schedule?.enabled ?? false,
    interval: schedule?.interval ?? "hourly",
    timezone: schedule?.timezone ?? preferences?.timezone ?? "Africa/Lagos",
    categories: schedule?.categories ?? [],
    scoreThreshold: schedule?.score_threshold ?? 80,
    maxJobsPerRun: schedule?.max_jobs_per_run ?? 10,
    inAppEnabled: preferences?.in_app_enabled ?? true,
    telegramEnabled: preferences?.telegram_enabled ?? false,
    hasTelegramToken: Boolean(preferences?.telegram_connected),
    telegramChatId: preferences?.telegram_chat_id ?? "",
    quietStart: preferences?.quiet_start ?? "22:00",
    quietEnd: preferences?.quiet_end ?? "07:00",
    dailyNotificationLimit: preferences?.daily_notification_limit ?? 10,
    dailyAiBudgetUsd: settings?.daily_ai_budget_usd ?? 2,
  };
  return (
    <PageShell
      title="Monitoring"
      description="Scheduled discovery, analysis, and alerts"
    >
      <div className="space-y-6">
        <section className="rounded-2xl border bg-surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">
                {schedule?.enabled
                  ? "Monitoring active"
                  : "Monitoring disabled"}
              </p>
              <p className="mt-1 text-sm text-muted">
                {schedule?.paused_reason
                  ? String(schedule.paused_reason)
                  : schedule?.next_run_at
                    ? `Next run ${new Date(String(schedule.next_run_at)).toLocaleString()}`
                    : "No future execution is scheduled."}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${schedule?.enabled ? "bg-success-soft text-success" : "bg-subtle text-muted"}`}
            >
              {schedule?.enabled ? "Active" : "Off"}
            </span>
          </div>
        </section>
        <ActivitySummary totals={totals} />
        <MonitoringSettingsForm initial={initial} />
        <RunHistory runs={runs} />
      </div>
    </PageShell>
  );
}
