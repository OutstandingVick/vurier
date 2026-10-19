"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { boundedAdjustments } from "@/core/analytics";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
export type AnalyticsActionState = { error?: string; message?: string };
async function session() {
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) throw new Error("Your session expired. Sign in and try again.");
  return { client: createAdminClient(), user };
}

export async function saveApplicationOutcome(
  _: AnalyticsActionState,
  formData: FormData,
): Promise<AnalyticsActionState> {
  const parsed = z
    .object({
      applicationId: z.string().uuid(),
      earnings: z.union([
        z.literal(""),
        z.coerce.number().nonnegative().max(100_000_000),
      ]),
      timeMinutes: z.union([
        z.literal(""),
        z.coerce.number().int().nonnegative().max(100_000),
      ]),
      earningsConfirmed: z.boolean(),
      timeConfirmed: z.boolean(),
      note: z.string().trim().max(1_000),
    })
    .safeParse({
      ...Object.fromEntries(formData),
      earningsConfirmed: formData.get("earningsConfirmed") === "on",
      timeConfirmed: formData.get("timeConfirmed") === "on",
    });
  if (!parsed.success)
    return {
      error: parsed.error.issues[0]?.message ?? "Check the outcome values.",
    };
  try {
    const { client, user } = await session();
    const { error } = await client
      .from("applications")
      .update({
        earnings: parsed.data.earnings === "" ? null : parsed.data.earnings,
        earnings_confirmed:
          parsed.data.earnings === "" ? false : parsed.data.earningsConfirmed,
        time_invested_minutes:
          parsed.data.timeMinutes === "" ? null : parsed.data.timeMinutes,
        time_confirmed:
          parsed.data.timeMinutes === "" ? false : parsed.data.timeConfirmed,
        outcome_note: parsed.data.note || null,
      })
      .eq("id", parsed.data.applicationId)
      .eq("user_id", user.id);
    if (error) throw error;
    revalidatePath("/dashboard/analytics");
    revalidatePath(`/dashboard/applications/${parsed.data.applicationId}`);
    return { message: "Outcome details saved." };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to save outcome details.",
    };
  }
}

export async function saveExternalExpense(
  _: AnalyticsActionState,
  formData: FormData,
): Promise<AnalyticsActionState> {
  const parsed = z
    .object({
      category: z.enum(["research", "infrastructure", "other"]),
      provider: z.string().trim().max(100),
      description: z.string().trim().min(1).max(500),
      amountUsd: z.coerce.number().nonnegative().max(1_000_000),
      estimated: z.boolean(),
      incurredAt: z.string().date(),
    })
    .safeParse({
      ...Object.fromEntries(formData),
      estimated: formData.get("estimated") === "on",
    });
  if (!parsed.success)
    return {
      error: parsed.error.issues[0]?.message ?? "Check the expense details.",
    };
  try {
    const { client, user } = await session();
    const { error } = await client.from("external_expenses").insert({
      user_id: user.id,
      category: parsed.data.category,
      provider: parsed.data.provider || null,
      description: parsed.data.description,
      amount_usd: parsed.data.amountUsd,
      estimated: parsed.data.estimated,
      incurred_at: new Date(
        `${parsed.data.incurredAt}T12:00:00Z`,
      ).toISOString(),
    });
    if (error) throw error;
    revalidatePath("/dashboard/analytics");
    return { message: "Expense recorded." };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to record expense.",
    };
  }
}

export async function rebuildFeedbackAdjustments(
  _: AnalyticsActionState,
  formData: FormData,
): Promise<AnalyticsActionState> {
  const enabled = formData.get("enabled") === "on";
  try {
    const { client, user } = await session();
    const { data: settings } = await client
      .from("settings")
      .select("feedback_max_adjustment")
      .eq("user_id", user.id)
      .single();
    const [{ data: apps }, { data: analyses }] = await Promise.all([
      client
        .from("applications")
        .select("job_id,status,jobs(category)")
        .eq("user_id", user.id)
        .in("status", [
          "interviewing",
          "offered",
          "won",
          "hired",
          "lost",
          "rejected",
        ]),
      client
        .from("job_analyses")
        .select("job_id,recommendation")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);
    const recommendations = new Map(
      (analyses ?? []).map((row) => [row.job_id, row.recommendation]),
    );
    const signals = (apps ?? []).flatMap((row) => {
      const relatedJob = Array.isArray(row.jobs) ? row.jobs[0] : row.jobs;
      const category = relatedJob?.category;
      if (!category) return [];
      const outcome = ["won", "hired"].includes(row.status)
        ? "hired"
        : ["interviewing", "offered"].includes(row.status)
          ? "interview"
          : row.status === "rejected"
            ? "rejected"
            : "no_response";
      return [
        {
          factor: `category:${category}`,
          recommended: ["apply", "consider"].includes(
            recommendations.get(row.job_id) ?? "",
          ),
          outcome,
        } as const,
      ];
    });
    const adjustments = boundedAdjustments(
      signals,
      enabled,
      Number(settings?.feedback_max_adjustment ?? 5),
    );
    const admin = createAdminClient();
    const { error: disableError } = await admin
      .from("ranking_adjustments")
      .update({ active: false, rolled_back_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("active", true);
    if (disableError) throw disableError;
    if (adjustments.length) {
      const { error } = await admin
        .from("ranking_adjustments")
        .insert(adjustments.map((item) => ({ user_id: user.id, ...item })));
      if (error) throw error;
    }
    const { error: settingsError } = await client
      .from("settings")
      .update({ feedback_optimization_enabled: enabled })
      .eq("user_id", user.id);
    if (settingsError) throw settingsError;
    revalidatePath("/dashboard/analytics");
    return {
      message: enabled
        ? `${adjustments.length} bounded adjustment(s) activated.`
        : "Feedback optimization disabled and active adjustments rolled back.",
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to rebuild feedback adjustments.",
    };
  }
}

export async function rollbackAdjustment(formData: FormData) {
  const id = z.string().uuid().safeParse(formData.get("adjustmentId"));
  if (!id.success) return;
  const { client, user } = await session();
  await client
    .from("ranking_adjustments")
    .update({ active: false, rolled_back_at: new Date().toISOString() })
    .eq("id", id.data)
    .eq("user_id", user.id);
  revalidatePath("/dashboard/analytics");
}
