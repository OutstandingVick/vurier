import { ConnectionStatus } from "@/components/settings/connection-status";
import { SettingsForm } from "@/components/settings/settings-form";
import { PageShell } from "@/components/dashboard/page-shell";
import { hasDeepSeekEnv, hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const fallback = { displayName: "", headline: "", bio: "", categories: ["Frontend Development", "Web3 & Fintech", "Technical Writing"], minimumFixedBudget: null, minimumHourlyRate: null, maximumConnects: null, model: "deepseek-flash", reasoning: "medium" };
  let initial = fallback;
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const [{ data: profile }, { data: settings }] = await Promise.all([supabase.from("profiles").select("display_name,headline,bio").eq("id", user.id).maybeSingle(), supabase.from("settings").select("preferred_categories,minimum_fixed_budget,minimum_hourly_rate,maximum_connects_per_job,preferred_model,reasoning_effort").eq("user_id", user.id).maybeSingle()]);
      initial = { displayName: profile?.display_name ?? "", headline: profile?.headline ?? "", bio: profile?.bio ?? "", categories: settings?.preferred_categories ?? fallback.categories, minimumFixedBudget: settings?.minimum_fixed_budget ?? null, minimumHourlyRate: settings?.minimum_hourly_rate ?? null, maximumConnects: settings?.maximum_connects_per_job ?? null, model: settings?.preferred_model ?? fallback.model, reasoning: settings?.reasoning_effort ?? fallback.reasoning };
    }
  }
  return <PageShell title="Settings" description="Profile, opportunity preferences, and connections"><div className="mb-6 rounded-2xl bg-surface p-5 shadow-card sm:p-6"><h2 className="text-lg font-semibold tracking-[-0.02em]">Connection status</h2><div className="mt-5 grid gap-3 lg:grid-cols-3"><ConnectionStatus label="Supabase" configured={hasSupabaseEnv()} description="Authentication and database connection." /><ConnectionStatus label="DeepSeek" configured={hasDeepSeekEnv()} description="Server-side AI model access." /><ConnectionStatus label="Upwork" configured={false} description="Authorized integration is reserved for Phase 2." /></div></div><SettingsForm initial={initial} /></PageShell>;
}
