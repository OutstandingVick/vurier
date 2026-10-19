"use server";
import { revalidatePath } from "next/cache";
import { integrationHealth } from "@/core/reliability/health";
import { hasDeepSeekEnv, hasSupabaseEnv, hasUpworkEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
export async function refreshIntegrationHealth() {
  const auth = await createClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) throw new Error("Sign in to refresh integration health.");
  const [{ data: upwork }, { data: telegram }] = await Promise.all([
    auth
      .from("discovery_source_status")
      .select("status")
      .eq("user_id", user.id)
      .eq("provider", "upwork_api")
      .maybeSingle(),
    auth
      .from("notification_preferences")
      .select("telegram_connected")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);
  const rows = integrationHealth({
    supabase: hasSupabaseEnv(),
    deepseek: hasDeepSeekEnv(),
    upworkConfigured: hasUpworkEnv(),
    upworkConnected: upwork?.status === "connected",
    trigger: Boolean(
      process.env.TRIGGER_SECRET_KEY && process.env.TRIGGER_PROJECT_REF,
    ),
    telegramConnected: telegram?.telegram_connected ?? false,
  });
  const { error } = await createAdminClient()
    .from("integration_health")
    .upsert(
      rows.map((row) => ({
        user_id: user.id,
        ...row,
        checked_at: new Date().toISOString(),
      })),
      { onConflict: "user_id,integration" },
    );
  if (error) throw error;
  revalidatePath("/dashboard/analytics");
}
