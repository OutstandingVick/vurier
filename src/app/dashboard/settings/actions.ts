"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { validateWeights } from "@/core/opportunities/scorer";
import type { ScoringWeights } from "@/core/opportunities/types";

export type SettingsState = { message?: string; error?: string };

const optionalMoney = z.preprocess(
  (value) => (value === "" ? null : Number(value)),
  z.number().nonnegative().nullable(),
);

const settingsSchema = z.object({
  displayName: z.string().trim().max(80),
  headline: z.string().trim().max(160),
  bio: z.string().trim().max(1200),
  categories: z.array(z.string()).min(1, "Select at least one category."),
  minimumFixedBudget: optionalMoney,
  minimumHourlyRate: optionalMoney,
  maximumConnects: z.preprocess(
    (value) => (value === "" ? null : Number(value)),
    z.number().int().nonnegative().nullable(),
  ),
  model: z.enum(["deepseek-flash", "deepseek-v4-pro"]),
  reasoning: z.enum(["low", "medium", "high"]),
  verifiedSkills: z
    .string()
    .transform((value) =>
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    )
    .pipe(z.array(z.string().max(80)).max(50)),
  dailyAnalysisLimit: z.coerce.number().int().min(1).max(200),
  monthlyAiBudgetUsd: z.coerce.number().min(0.01).max(1000),
  dailyConnectsLimit: z.coerce.number().int().min(0).max(10000),
  monthlyConnectsLimit: z.coerce.number().int().min(0).max(100000),
  connectsUsdRate: z.coerce.number().min(0).max(100),
  monthlyResearchBudgetUsd: z.coerce.number().min(0).max(100000),
  feedbackMaxAdjustment: z.coerce.number().min(0).max(10),
  skillMatch: z.coerce.number().nonnegative(),
  portfolioRelevance: z.coerce.number().nonnegative(),
  budgetValue: z.coerce.number().nonnegative(),
  competition: z.coerce.number().nonnegative(),
  clientCredibility: z.coerce.number().nonnegative(),
  recency: z.coerce.number().nonnegative(),
});

export async function saveSettings(
  _: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const parsed = settingsSchema.safeParse({
    displayName: formData.get("displayName"),
    headline: formData.get("headline"),
    bio: formData.get("bio"),
    categories: formData.getAll("categories"),
    minimumFixedBudget: formData.get("minimumFixedBudget"),
    minimumHourlyRate: formData.get("minimumHourlyRate"),
    maximumConnects: formData.get("maximumConnects"),
    model: formData.get("model"),
    reasoning: formData.get("reasoning"),
    verifiedSkills: formData.get("verifiedSkills"),
    dailyAnalysisLimit: formData.get("dailyAnalysisLimit"),
    monthlyAiBudgetUsd: formData.get("monthlyAiBudgetUsd"),
    dailyConnectsLimit: formData.get("dailyConnectsLimit"),
    monthlyConnectsLimit: formData.get("monthlyConnectsLimit"),
    connectsUsdRate: formData.get("connectsUsdRate"),
    monthlyResearchBudgetUsd: formData.get("monthlyResearchBudgetUsd"),
    feedbackMaxAdjustment: formData.get("feedbackMaxAdjustment"),
    skillMatch: formData.get("skillMatch"),
    portfolioRelevance: formData.get("portfolioRelevance"),
    budgetValue: formData.get("budgetValue"),
    competition: formData.get("competition"),
    clientCredibility: formData.get("clientCredibility"),
    recency: formData.get("recency"),
  });
  if (!parsed.success)
    return {
      error: parsed.error.issues[0]?.message ?? "Check the form and try again.",
    };
  const weights = {
    skillMatch: parsed.data.skillMatch,
    portfolioRelevance: parsed.data.portfolioRelevance,
    budgetValue: parsed.data.budgetValue,
    competition: parsed.data.competition,
    clientCredibility: parsed.data.clientCredibility,
    recency: parsed.data.recency,
  } satisfies ScoringWeights;
  try {
    validateWeights(weights);
  } catch {
    return { error: "Scoring weights must total 100%." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Sign in and try again." };

  const profileResult = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.displayName,
      headline: parsed.data.headline,
      bio: parsed.data.bio,
      verified_skills: parsed.data.verifiedSkills,
    })
    .eq("id", user.id);
  const settingsResult = await supabase
    .from("settings")
    .update({
      preferred_categories: parsed.data.categories,
      minimum_fixed_budget: parsed.data.minimumFixedBudget,
      minimum_hourly_rate: parsed.data.minimumHourlyRate,
      maximum_connects_per_job: parsed.data.maximumConnects,
      preferred_model: parsed.data.model,
      reasoning_effort: parsed.data.reasoning,
      scoring_weights: weights,
      daily_analysis_limit: parsed.data.dailyAnalysisLimit,
      monthly_ai_budget_usd: parsed.data.monthlyAiBudgetUsd,
      daily_connects_limit: parsed.data.dailyConnectsLimit,
      monthly_connects_limit: parsed.data.monthlyConnectsLimit,
      connects_usd_rate: parsed.data.connectsUsdRate,
      monthly_research_budget_usd: parsed.data.monthlyResearchBudgetUsd,
      feedback_max_adjustment: parsed.data.feedbackMaxAdjustment,
    })
    .eq("user_id", user.id);
  if (profileResult.error || settingsResult.error)
    return {
      error: "Unable to save settings. Check your connection and try again.",
    };
  revalidatePath("/dashboard/settings");
  return { message: "Settings saved." };
}
