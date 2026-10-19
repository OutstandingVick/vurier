"use server";

import { schedules } from "@trigger.dev/sdk";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { cronForInterval } from "@/core/monitoring/schedule";
import { MONITOR_INTERVALS } from "@/core/monitoring/types";
import { monitorJobs } from "@/trigger/monitor-jobs";
import { encryptToken } from "@/lib/crypto/token-vault";
import { getServerEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type MonitoringActionState = { error?: string; message?: string };
const schema = z.object({
  enabled: z.coerce.boolean(),
  interval: z.enum(MONITOR_INTERVALS),
  timezone: z.string().min(1).max(100),
  categories: z.array(z.string().max(100)).max(20),
  scoreThreshold: z.coerce.number().int().min(0).max(100),
  maxJobsPerRun: z.coerce.number().int().min(1).max(25),
  inAppEnabled: z.coerce.boolean(),
  telegramEnabled: z.coerce.boolean(),
  telegramBotToken: z.string().trim().optional(),
  telegramChatId: z.string().trim().max(100).optional(),
  quietStart: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional()
    .or(z.literal("")),
  quietEnd: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional()
    .or(z.literal("")),
  dailyNotificationLimit: z.coerce.number().int().min(0).max(100),
  dailyAiBudgetUsd: z.coerce.number().min(0).max(1_000),
});

async function auth() {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) throw new Error("Your session expired. Sign in and try again.");
  return { client, user };
}

export async function saveMonitoringSettings(
  _: MonitoringActionState,
  formData: FormData,
): Promise<MonitoringActionState> {
  const parsed = schema.safeParse({
    ...Object.fromEntries(formData),
    enabled: formData.get("enabled") === "on",
    inAppEnabled: formData.get("inAppEnabled") === "on",
    telegramEnabled: formData.get("telegramEnabled") === "on",
    categories: formData.getAll("categories"),
  });
  if (!parsed.success)
    return {
      error:
        parsed.error.issues[0]?.message ?? "Check the monitoring settings.",
    };
  try {
    const env = getServerEnv();
    if (parsed.data.enabled && !env.TRIGGER_SECRET_KEY)
      return {
        error: "Add TRIGGER_SECRET_KEY before enabling scheduled monitoring.",
      };
    if (
      parsed.data.telegramEnabled &&
      !parsed.data.telegramBotToken &&
      !formData.get("hasTelegramToken")
    )
      return {
        error: "Add a Telegram bot token before enabling Telegram alerts.",
      };
    if (parsed.data.telegramEnabled && !env.INTEGRATION_ENCRYPTION_KEY)
      return {
        error:
          "Configure INTEGRATION_ENCRYPTION_KEY before enabling Telegram alerts.",
      };
    const { client, user } = await auth();
    const admin = createAdminClient();
    const [{ data: current }, { data: currentTelegram }] = await Promise.all([
      client
        .from("monitoring_schedules")
        .select("id,trigger_schedule_id")
        .eq("user_id", user.id)
        .maybeSingle(),
      admin
        .from("telegram_connections")
        .select("encrypted_bot_token")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);
    const { data: schedule, error } = await client
      .from("monitoring_schedules")
      .upsert(
        {
          user_id: user.id,
          enabled: false,
          interval: parsed.data.interval,
          timezone: parsed.data.timezone,
          categories: parsed.data.categories,
          score_threshold: parsed.data.scoreThreshold,
          max_jobs_per_run: parsed.data.maxJobsPerRun,
        },
        { onConflict: "user_id" },
      )
      .select("id,trigger_schedule_id")
      .single();
    if (error) throw error;
    let triggerScheduleId =
      current?.trigger_schedule_id ?? schedule.trigger_schedule_id;
    let nextRunAt: string | null = null;
    if (parsed.data.enabled) {
      const options = {
        task: monitorJobs.id,
        cron: cronForInterval(parsed.data.interval),
        timezone: parsed.data.timezone,
        externalId: user.id,
      };
      const remote = triggerScheduleId
        ? await schedules.update(triggerScheduleId, options)
        : await schedules.create({
            ...options,
            deduplicationKey: `vurier:${user.id}`,
          });
      triggerScheduleId = remote.id;
      nextRunAt = remote.nextRun?.toISOString() ?? null;
      await schedules.activate(triggerScheduleId);
    } else if (triggerScheduleId && env.TRIGGER_SECRET_KEY)
      await schedules.deactivate(triggerScheduleId);
    await client
      .from("monitoring_schedules")
      .update({
        enabled: parsed.data.enabled,
        trigger_schedule_id: triggerScheduleId,
        next_run_at: nextRunAt,
      })
      .eq("id", schedule.id)
      .eq("user_id", user.id);
    const encryptionKey = env.INTEGRATION_ENCRYPTION_KEY;
    const encryptedToken = parsed.data.telegramBotToken
      ? encryptionKey
        ? encryptToken(
            parsed.data.telegramBotToken,
            encryptionKey,
            `${user.id}:telegram:bot`,
          )
        : null
      : (currentTelegram?.encrypted_bot_token ?? null);
    if (parsed.data.telegramEnabled && !encryptedToken)
      return {
        error: "Configure credential encryption before enabling Telegram.",
      };
    await client.from("notification_preferences").upsert(
      {
        user_id: user.id,
        in_app_enabled: parsed.data.inAppEnabled,
        telegram_enabled: parsed.data.telegramEnabled,
        telegram_connected: Boolean(encryptedToken),
        telegram_chat_id: parsed.data.telegramChatId || null,
        quiet_start: parsed.data.quietStart || null,
        quiet_end: parsed.data.quietEnd || null,
        timezone: parsed.data.timezone,
        daily_notification_limit: parsed.data.dailyNotificationLimit,
      },
      { onConflict: "user_id" },
    );
    if (encryptedToken)
      await admin
        .from("telegram_connections")
        .upsert(
          { user_id: user.id, encrypted_bot_token: encryptedToken },
          { onConflict: "user_id" },
        );
    await client
      .from("settings")
      .update({ daily_ai_budget_usd: parsed.data.dailyAiBudgetUsd })
      .eq("user_id", user.id);
    revalidatePath("/dashboard/monitoring");
    revalidatePath("/dashboard/settings");
    return {
      message: parsed.data.enabled
        ? "Monitoring schedule enabled."
        : "Monitoring settings saved. Schedule is disabled.",
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to save monitoring settings.",
    };
  }
}
