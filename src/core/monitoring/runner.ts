import type { SupabaseClient } from "@supabase/supabase-js";
import { analyzeOpportunity } from "@/core/opportunities/analyzer";
import { mapJobRow, mapMatchingProfile } from "@/core/opportunities/mapper";
import {
  DEFAULT_SCORING_WEIGHTS,
  type ScoringWeights,
} from "@/core/opportunities/types";
import { upsertJobs } from "@/core/jobs/repository";
import type { JobSearchFilters, NormalizedJob } from "@/core/jobs/types";
import { getValidUpworkToken } from "@/integrations/upwork/connection-service";
import { UpworkApiClient } from "@/integrations/upwork/client";
import { UpworkPermissionError } from "@/integrations/upwork/errors";
import { TelegramClient, TelegramError } from "@/integrations/telegram";
import { decryptToken } from "@/lib/crypto/token-vault";
import { getServerEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAlertEligible } from "./eligibility";
import { rankMonitoringCandidates } from "./candidates";
import { assertRunLimits } from "./limits";
import { isQuietTime } from "./quiet-hours";
import { withRetry } from "./retry";
import type { MonitoringStats } from "./types";

type RunInput = {
  userId: string;
  scheduleId: string;
  idempotencyKey: string;
  triggerRunId?: string;
};
type AlertAnalysis = {
  id: string;
  overall_score: number;
  strengths: string[] | null;
};
type AlertPreferences = {
  daily_notification_limit: number;
  timezone: string;
  quiet_start: string | null;
  quiet_end: string | null;
  in_app_enabled: boolean;
  telegram_enabled: boolean;
  telegram_bot_token_encrypted: string | null;
  telegram_chat_id: string | null;
};

export async function runMonitoring(input: RunInput) {
  const client = createAdminClient();
  const { data: ownedSchedule } = await client
    .from("monitoring_schedules")
    .select("user_id")
    .eq("id", input.scheduleId)
    .single();
  if (!ownedSchedule || ownedSchedule.user_id !== input.userId)
    throw new Error("Monitoring schedule identity mismatch.");
  const leaseOwner = input.triggerRunId ?? crypto.randomUUID();
  const { data: claim, error: claimError } = await client
    .rpc("claim_monitoring_run", {
      p_user_id: input.userId,
      p_schedule_id: input.scheduleId,
      p_idempotency_key: input.idempotencyKey,
      p_lease_owner: leaseOwner,
    })
    .single();
  if (claimError || !claim)
    throw claimError ?? new Error("Unable to claim monitoring run.");
  const claimed = claim as { run_id: string; acquired: boolean };
  const { data: run, error: runError } = await client
    .from("monitoring_runs")
    .select("*")
    .eq("id", claimed.run_id)
    .single();
  if (runError || !run)
    throw runError ?? new Error("Monitoring run not found.");
  if (!claimed.acquired) return run;
  const stats: MonitoringStats = {
    discovered: 0,
    analyzed: 0,
    notified: 0,
    failed: 0,
    cached: 0,
    estimatedCostUsd: 0,
  };
  try {
    const context = await loadContext(client, input.userId, input.scheduleId);
    if (!context.schedule.enabled)
      return finish(client, run.id, "skipped", stats, "schedule_disabled");
    const token = await getValidUpworkToken(input.userId);
    if (!token)
      return finish(client, run.id, "skipped", stats, "upwork_disconnected");
    const searches = context.searches.length
      ? context.searches
      : [
          {
            filters: {
              query: context.schedule.categories.join(" OR "),
              sort: "newest",
              pageSize: context.schedule.max_jobs_per_run,
            },
          },
        ];
    const fetched = [];
    const upwork = new UpworkApiClient();
    for (const search of searches) {
      const result = await withRetry(
        () =>
          upwork.searchJobs(
            token.accessToken,
            search.filters as JobSearchFilters,
            input.userId,
          ),
        { retryable: (error) => !(error instanceof UpworkPermissionError) },
      );
      fetched.push(...result.jobs);
    }
    const unique = [
      ...new Map(fetched.map((job) => [job.externalId, job])).values(),
    ];
    const externalIds = unique.map((job) => job.externalId);
    const { data: known } = externalIds.length
      ? await client
          .from("jobs")
          .select("external_id")
          .eq("user_id", input.userId)
          .eq("source", "upwork_api")
          .in("external_id", externalIds)
      : { data: [] };
    const knownIds = new Set((known ?? []).map((job) => job.external_id));
    const newJobs = rankMonitoringCandidates(
      unique.filter((job) => !knownIds.has(job.externalId)),
    ).slice(0, context.schedule.max_jobs_per_run);
    const saved = await upsertJobs(
      client,
      input.userId,
      unique,
      token.sourceId,
    );
    const savedByExternalId = new Map(
      saved.map((job) => [job.external_id, job.id]),
    );
    stats.discovered = newJobs.length;
    for (const normalized of newJobs) {
      try {
        assertRunLimits({
          dailyCost: context.dailyCost + stats.estimatedCostUsd,
          monthlyCost: context.monthlyCost + stats.estimatedCostUsd,
          dailyLimit: context.settings.daily_ai_budget_usd,
          monthlyLimit: context.settings.monthly_ai_budget_usd,
          analyzed: stats.analyzed,
          maxJobs: context.schedule.max_jobs_per_run,
        });
        const jobId = savedByExternalId.get(normalized.externalId);
        if (!jobId) continue;
        const result = await analyzeOpportunity({
          client,
          userId: input.userId,
          job: mapJobRow({ ...normalizedToRow(normalized), id: jobId }),
          profile: context.profile,
          weights: context.weights,
          limits: {
            dailyAnalyses: context.settings.daily_analysis_limit,
            monthlyCostUsd: context.settings.monthly_ai_budget_usd,
          },
        });
        if (result.cached) stats.cached++;
        else {
          stats.analyzed++;
          stats.estimatedCostUsd += Number(
            result.analysis.estimated_cost_usd ?? 0,
          );
        }
        const analysis = result.analysis;
        if (
          isAlertEligible({
            score: analysis.overall_score,
            threshold: context.schedule.score_threshold,
            budgetMin: normalized.budgetMin,
            hourlyMin: normalized.hourlyMin,
            preferredFixed: context.settings.minimum_fixed_budget,
            preferredHourly: context.settings.minimum_hourly_rate,
          })
        ) {
          stats.notified += await deliverAlerts(client, {
            runId: run.id,
            userId: input.userId,
            jobId,
            analysis,
            job: normalized,
            preferences: context.preferences,
            deliveredToday: context.deliveredToday + stats.notified,
          });
        }
      } catch (error) {
        stats.failed++;
        await recordError(client, input.userId, run.id, "analysis", error);
        if (/spending limit/i.test(error instanceof Error ? error.message : ""))
          break;
      }
    }
    await client
      .from("monitoring_schedules")
      .update({ last_run_at: new Date().toISOString(), paused_reason: null })
      .eq("id", input.scheduleId)
      .eq("user_id", input.userId);
    return finish(
      client,
      run.id,
      stats.failed ? "partial" : "completed",
      stats,
    );
  } catch (error) {
    await recordError(client, input.userId, run.id, "discovery", error);
    await client
      .from("monitoring_schedules")
      .update({
        paused_reason:
          error instanceof UpworkPermissionError
            ? "Upwork job-search permission is unavailable."
            : null,
      })
      .eq("id", input.scheduleId);
    await finish(
      client,
      run.id,
      "failed",
      { ...stats, failed: stats.failed + 1 },
      "run_failed",
      error instanceof Error ? error.message : "Monitoring failed",
    );
    throw error;
  }
}

async function loadContext(
  client: SupabaseClient,
  userId: string,
  scheduleId: string,
) {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const month = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1),
  );
  const [
    { data: schedule },
    { data: preferences },
    { data: telegram },
    { data: settings },
    { data: profile },
    { data: portfolio },
    { data: searches },
    { data: daily },
    { data: monthly },
    { count: deliveredToday },
  ] = await Promise.all([
    client
      .from("monitoring_schedules")
      .select("*")
      .eq("id", scheduleId)
      .eq("user_id", userId)
      .single(),
    client
      .from("notification_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle(),
    client
      .from("telegram_connections")
      .select("encrypted_bot_token")
      .eq("user_id", userId)
      .maybeSingle(),
    client.from("settings").select("*").eq("user_id", userId).single(),
    client
      .from("profiles")
      .select("bio,verified_skills")
      .eq("id", userId)
      .single(),
    client
      .from("portfolio_items")
      .select("title,description,skills")
      .eq("user_id", userId)
      .eq("verified", true),
    client.from("saved_searches").select("filters").eq("user_id", userId),
    client
      .from("job_analyses")
      .select("estimated_cost_usd")
      .eq("user_id", userId)
      .gte("created_at", start.toISOString()),
    client
      .from("job_analyses")
      .select("estimated_cost_usd")
      .eq("user_id", userId)
      .gte("created_at", month.toISOString()),
    client
      .from("notification_deliveries")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "delivered")
      .gte("created_at", start.toISOString()),
  ]);
  if (!schedule || !settings)
    throw new Error("Monitoring configuration is incomplete.");
  return {
    schedule,
    preferences: {
      ...(preferences ?? {
        in_app_enabled: true,
        telegram_enabled: false,
        quiet_start: null,
        quiet_end: null,
        timezone: schedule.timezone,
        daily_notification_limit: 10,
      }),
      telegram_bot_token_encrypted: telegram?.encrypted_bot_token ?? null,
    },
    settings,
    profile: mapMatchingProfile(profile, settings, portfolio ?? []),
    weights: (settings.scoring_weights ??
      DEFAULT_SCORING_WEIGHTS) as ScoringWeights,
    searches: searches ?? [],
    dailyCost: sumCost(daily),
    monthlyCost: sumCost(monthly),
    deliveredToday: deliveredToday ?? 0,
  };
}

async function deliverAlerts(
  client: SupabaseClient,
  input: {
    runId: string;
    userId: string;
    jobId: string;
    analysis: AlertAnalysis;
    job: NormalizedJob;
    preferences: AlertPreferences;
    deliveredToday: number;
  },
) {
  if (input.deliveredToday >= input.preferences.daily_notification_limit)
    return 0;
  if (
    isQuietTime({
      timezone: input.preferences.timezone,
      start: input.preferences.quiet_start,
      end: input.preferences.quiet_end,
    })
  )
    return 0;
  let delivered = 0;
  const appUrl = getServerEnv().NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const actionUrl = `/dashboard/opportunities/${input.jobId}`;
  if (input.preferences.in_app_enabled) {
    const key = `${input.analysis.id}:in_app`;
    const { data: delivery, error } = await client
      .from("notification_deliveries")
      .insert({
        user_id: input.userId,
        monitoring_run_id: input.runId,
        job_id: input.jobId,
        analysis_id: input.analysis.id,
        channel: "in_app",
        status: "pending",
        idempotency_key: key,
      })
      .select("id")
      .single();
    if (!error && delivery) {
      const { error: notificationError } = await client
        .from("notifications")
        .insert({
          user_id: input.userId,
          kind: "high_fit_job",
          category: "opportunity",
          title: `${input.analysis.overall_score}/100 match: ${input.job.title}`,
          message:
            (input.analysis.strengths ?? []).slice(0, 2).join(" · ") ||
            "A new opportunity meets your alert rules.",
          resource_type: "job",
          resource_id: input.jobId,
          action_url: actionUrl,
        });
      await client
        .from("notification_deliveries")
        .update(
          notificationError
            ? {
                status: "failed",
                attempts: 1,
                last_error: notificationError.message,
              }
            : {
                status: "delivered",
                attempts: 1,
                delivered_at: new Date().toISOString(),
              },
        )
        .eq("id", delivery.id);
      if (!notificationError) delivered++;
    }
  }
  if (
    input.deliveredToday + delivered <
      input.preferences.daily_notification_limit &&
    input.preferences.telegram_enabled &&
    input.preferences.telegram_bot_token_encrypted &&
    input.preferences.telegram_chat_id
  ) {
    const encryptedBotToken = input.preferences.telegram_bot_token_encrypted;
    const telegramChatId = input.preferences.telegram_chat_id;
    const key = `${input.analysis.id}:telegram`;
    const { data: delivery, error } = await client
      .from("notification_deliveries")
      .insert({
        user_id: input.userId,
        monitoring_run_id: input.runId,
        job_id: input.jobId,
        analysis_id: input.analysis.id,
        channel: "telegram",
        status: "pending",
        idempotency_key: key,
      })
      .select("id")
      .single();
    if (!error && delivery) {
      try {
        const encryptionKey = getServerEnv().INTEGRATION_ENCRYPTION_KEY;
        if (!encryptionKey)
          throw new Error("Telegram credential encryption is unavailable.");
        const sent = await withRetry(
          () =>
            new TelegramClient().sendAlert(
              decryptToken(
                encryptedBotToken,
                encryptionKey,
                `${input.userId}:telegram:bot`,
              ),
              telegramChatId,
              {
                title: input.job.title,
                budget: formatBudget(input.job),
                score: input.analysis.overall_score,
                insights: input.analysis.strengths ?? [],
                vurierUrl: `${appUrl}${actionUrl}`,
                upworkUrl: input.job.sourceUrl,
              },
            ),
          {
            retryable: (error) =>
              error instanceof TelegramError && error.retryable,
          },
        );
        await client
          .from("notification_deliveries")
          .update({
            status: "delivered",
            provider_message_id: sent.messageId,
            attempts: 1,
            delivered_at: new Date().toISOString(),
          })
          .eq("id", delivery.id);
        delivered++;
      } catch (sendError) {
        await client
          .from("notification_deliveries")
          .update({
            status: "failed",
            attempts: 3,
            last_error:
              sendError instanceof Error
                ? sendError.message
                : "Telegram failed",
          })
          .eq("id", delivery.id);
      }
    }
  }
  return delivered;
}

const sumCost = (rows: Array<{ estimated_cost_usd: number }> | null) =>
  (rows ?? []).reduce(
    (sum, row) => sum + Number(row.estimated_cost_usd ?? 0),
    0,
  );
const normalizedToRow = (job: NormalizedJob) => ({
  title: job.title,
  description: job.description,
  category: job.category,
  skills: job.skills,
  budget_min: job.budgetMin,
  budget_max: job.budgetMax,
  hourly_min: job.hourlyMin,
  hourly_max: job.hourlyMax,
  proposal_count: job.proposalCount,
  client_payment_verification: job.clientPaymentVerification,
  client_rating: job.clientRating,
  client_spend: job.clientSpend,
  published_at: job.publishedAt,
});
const formatBudget = (job: NormalizedJob) =>
  job.budgetMin !== null
    ? `${job.currency} ${job.budgetMin.toLocaleString()}${job.budgetMax && job.budgetMax !== job.budgetMin ? `–${job.budgetMax.toLocaleString()}` : ""}`
    : job.hourlyMin !== null
      ? `${job.currency} ${job.hourlyMin}/hr`
      : "Budget unavailable";
async function recordError(
  client: SupabaseClient,
  userId: string,
  runId: string,
  stage: string,
  error: unknown,
) {
  await client.from("monitoring_errors").insert({
    user_id: userId,
    monitoring_run_id: runId,
    stage,
    code:
      error instanceof UpworkPermissionError
        ? "permission_denied"
        : error instanceof TelegramError
          ? "telegram_error"
          : "workflow_error",
    message:
      error instanceof Error ? error.message : "Unknown monitoring error",
    retryable:
      error instanceof TelegramError
        ? error.retryable
        : !(error instanceof UpworkPermissionError),
  });
}
async function finish(
  client: SupabaseClient,
  runId: string,
  status: string,
  stats: MonitoringStats,
  errorCode?: string,
  errorMessage?: string,
) {
  const { data } = await client
    .from("monitoring_runs")
    .update({
      status,
      completed_at: new Date().toISOString(),
      jobs_discovered: stats.discovered,
      opportunities_analyzed: stats.analyzed,
      notifications_delivered: stats.notified,
      failures: stats.failed,
      cached_analyses: stats.cached,
      estimated_cost_usd: stats.estimatedCostUsd,
      error_code: errorCode,
      error_message: errorMessage,
    })
    .eq("id", runId)
    .select("*")
    .single();
  return data;
}
