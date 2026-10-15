"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type SettingsState = { message?: string; error?: string };

const optionalMoney = z.preprocess((value) => value === "" ? null : Number(value), z.number().nonnegative().nullable());

const settingsSchema = z.object({
  displayName: z.string().trim().max(80),
  headline: z.string().trim().max(160),
  bio: z.string().trim().max(1200),
  categories: z.array(z.string()).min(1, "Select at least one category."),
  minimumFixedBudget: optionalMoney,
  minimumHourlyRate: optionalMoney,
  maximumConnects: z.preprocess((value) => value === "" ? null : Number(value), z.number().int().nonnegative().nullable()),
  model: z.enum(["deepseek-flash", "deepseek-v4-pro"]),
  reasoning: z.enum(["low", "medium", "high"]),
});

export async function saveSettings(_: SettingsState, formData: FormData): Promise<SettingsState> {
  const parsed = settingsSchema.safeParse({
    displayName: formData.get("displayName"), headline: formData.get("headline"), bio: formData.get("bio"),
    categories: formData.getAll("categories"), minimumFixedBudget: formData.get("minimumFixedBudget"),
    minimumHourlyRate: formData.get("minimumHourlyRate"), maximumConnects: formData.get("maximumConnects"),
    model: formData.get("model"), reasoning: formData.get("reasoning"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Sign in and try again." };

  const profileResult = await supabase.from("profiles").update({ display_name: parsed.data.displayName, headline: parsed.data.headline, bio: parsed.data.bio }).eq("id", user.id);
  const settingsResult = await supabase.from("settings").update({ preferred_categories: parsed.data.categories, minimum_fixed_budget: parsed.data.minimumFixedBudget, minimum_hourly_rate: parsed.data.minimumHourlyRate, maximum_connects_per_job: parsed.data.maximumConnects, preferred_model: parsed.data.model, reasoning_effort: parsed.data.reasoning }).eq("user_id", user.id);
  if (profileResult.error || settingsResult.error) return { error: "Unable to save settings. Check your connection and try again." };
  revalidatePath("/dashboard/settings");
  return { message: "Settings saved." };
}
