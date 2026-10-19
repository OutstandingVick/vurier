"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { analyzeOpportunity } from "@/core/opportunities/analyzer";
import { mapJobRow, mapMatchingProfile } from "@/core/opportunities/mapper";
import {
  DEFAULT_SCORING_WEIGHTS,
  type ScoringWeights,
} from "@/core/opportunities/types";
import { hasDeepSeekEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type AnalysisActionState = { message?: string; error?: string };
const idsSchema = z.array(z.string().uuid()).min(1).max(25);

async function context() {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) throw new Error("Your session expired. Sign in and try again.");
  const [
    { data: profile },
    { data: settings },
    { data: portfolio },
    { data: adjustments },
  ] = await Promise.all([
    client
      .from("profiles")
      .select("bio,verified_skills")
      .eq("id", user.id)
      .single(),
    client
      .from("settings")
      .select(
        "preferred_categories,minimum_fixed_budget,minimum_hourly_rate,scoring_weights,daily_analysis_limit,monthly_ai_budget_usd,feedback_optimization_enabled",
      )
      .eq("user_id", user.id)
      .single(),
    client
      .from("portfolio_items")
      .select("title,description,skills")
      .eq("user_id", user.id),
    client
      .from("ranking_adjustments")
      .select("factor,adjustment,explanation")
      .eq("user_id", user.id)
      .eq("active", true),
  ]);
  return {
    client,
    user,
    profile: mapMatchingProfile(profile, settings, portfolio ?? []),
    weights: (settings?.scoring_weights ??
      DEFAULT_SCORING_WEIGHTS) as ScoringWeights,
    limits: {
      dailyAnalyses: settings?.daily_analysis_limit ?? 25,
      monthlyCostUsd: Number(settings?.monthly_ai_budget_usd ?? 10),
    },
    optimizationEnabled: settings?.feedback_optimization_enabled ?? false,
    adjustments: adjustments ?? [],
  };
}

export async function analyzeJobs(
  _: AnalysisActionState,
  formData: FormData,
): Promise<AnalysisActionState> {
  if (!hasDeepSeekEnv())
    return {
      error:
        "DeepSeek is not configured. Add the server-side API key before analyzing opportunities.",
    };
  const parsed = idsSchema.safeParse(formData.getAll("jobIds"));
  if (!parsed.success)
    return { error: "Select between 1 and 25 opportunities to analyze." };
  try {
    const ctx = await context();
    const { data: run, error: runError } = await ctx.client
      .from("agent_runs")
      .insert({
        user_id: ctx.user.id,
        run_type: "opportunity_analysis",
        status: "running",
        started_at: new Date().toISOString(),
        metadata: { total: parsed.data.length, completed: 0, failed: 0 },
      })
      .select("id")
      .single();
    if (runError)
      return {
        error:
          runError.code === "23505"
            ? "An analysis batch is already running."
            : "Unable to start analysis. Try again.",
      };
    const { data: jobs, error } = await ctx.client
      .from("jobs")
      .select("*")
      .eq("user_id", ctx.user.id)
      .in("id", parsed.data);
    if (error) throw error;
    let completed = 0;
    let failed = 0;
    let tokens = 0;
    for (const row of jobs ?? []) {
      const { data: current } = await ctx.client
        .from("agent_runs")
        .select("status")
        .eq("id", run.id)
        .single();
      if (current?.status === "cancelled") break;
      try {
        const result = await analyzeOpportunity({
          client: ctx.client,
          userId: ctx.user.id,
          job: mapJobRow(row),
          profile: ctx.profile,
          weights: ctx.weights,
          limits: ctx.limits,
          adjustments: ctx.optimizationEnabled
            ? ctx.adjustments
                .filter((item) => item.factor === `category:${row.category}`)
                .map((item) => ({
                  adjustment: Number(item.adjustment),
                  explanation: item.explanation,
                }))
            : [],
        });
        completed++;
        tokens +=
          Number(result.analysis.input_tokens ?? 0) +
          Number(result.analysis.output_tokens ?? 0);
      } catch {
        failed++;
      }
      await ctx.client
        .from("agent_runs")
        .update({
          metadata: { total: parsed.data.length, completed, failed },
          input_tokens: tokens,
        })
        .eq("id", run.id);
    }
    const { data: latest } = await ctx.client
      .from("agent_runs")
      .select("status")
      .eq("id", run.id)
      .single();
    if (latest?.status !== "cancelled")
      await ctx.client
        .from("agent_runs")
        .update({
          status: failed === parsed.data.length ? "failed" : "completed",
          completed_at: new Date().toISOString(),
          metadata: { total: parsed.data.length, completed, failed },
        })
        .eq("id", run.id);
    revalidatePath("/dashboard/opportunities");
    return {
      message: `Analysis finished: ${completed} completed${failed ? `, ${failed} failed` : ""}.`,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to analyze opportunities. Try again.",
    };
  }
}

export async function cancelAnalysis(formData: FormData) {
  const id = z.string().uuid().safeParse(formData.get("runId"));
  if (!id.success) return;
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (user)
    await client
      .from("agent_runs")
      .update({ status: "cancelled", completed_at: new Date().toISOString() })
      .eq("id", id.data)
      .eq("user_id", user.id)
      .in("status", ["queued", "running"]);
  revalidatePath("/dashboard/opportunities");
}

export async function submitAnalysisFeedback(formData: FormData) {
  const parsed = z
    .object({
      analysisId: z.string().uuid(),
      feedback: z.enum(["accurate", "inaccurate"]),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (user)
    await client
      .from("job_analyses")
      .update({
        feedback: parsed.data.feedback,
        feedback_at: new Date().toISOString(),
      })
      .eq("id", parsed.data.analysisId)
      .eq("user_id", user.id);
  revalidatePath("/dashboard/opportunities");
}
