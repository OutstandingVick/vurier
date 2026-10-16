import type { SupabaseClient } from "@supabase/supabase-js";
import { isAnalysisFresh } from "@/core/opportunities/cache";
import type { AiAssessment } from "@/core/opportunities/schema";
import type { ScoringWeights } from "@/core/opportunities/types";

export async function findFreshAnalysis(
  client: SupabaseClient,
  userId: string,
  jobId: string,
  fingerprint: string,
) {
  const { data, error } = await client
    .from("job_analyses")
    .select("*")
    .eq("user_id", userId)
    .eq("job_id", jobId)
    .eq("input_fingerprint", fingerprint)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data && isAnalysisFresh(data.created_at) ? data : null;
}
export async function getUsage(client: SupabaseClient, userId: string) {
  const day = new Date();
  day.setUTCHours(0, 0, 0, 0);
  const month = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), 1));
  const [{ count, error: countError }, { data, error }] = await Promise.all([
    client
      .from("job_analyses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", day.toISOString()),
    client
      .from("job_analyses")
      .select("estimated_cost_usd")
      .eq("user_id", userId)
      .gte("created_at", month.toISOString()),
  ]);
  if (countError || error) throw countError ?? error;
  return {
    analyses: count ?? 0,
    estimatedCostUsd: (data ?? []).reduce(
      (sum, row) => sum + Number(row.estimated_cost_usd ?? 0),
      0,
    ),
  };
}
export async function saveAnalysis(
  client: SupabaseClient,
  input: {
    userId: string;
    jobId: string;
    assessment: AiAssessment;
    overall: number;
    confidence: number;
    recommendation: string;
    weights: ScoringWeights;
    screeningModel: string;
    deepModel: string | null;
    fingerprint: string;
    inputTokens: number;
    outputTokens: number;
    estimatedCostUsd: number;
  },
) {
  const { data, error } = await client
    .from("job_analyses")
    .upsert(
      {
        user_id: input.userId,
        job_id: input.jobId,
        model: input.deepModel ?? input.screeningModel,
        screening_model: input.screeningModel,
        deep_model: input.deepModel,
        model_version: "phase3-v1",
        overall_score: input.overall,
        fit_score: input.assessment.factors.skillMatch.score,
        value_score: input.assessment.factors.budgetValue.score,
        confidence_score: input.confidence,
        recommendation: input.recommendation,
        factor_scores: input.assessment.factors,
        scoring_weights: input.weights,
        rationale: input.assessment.nextSteps,
        strengths: input.assessment.strengths,
        gaps: input.assessment.gaps,
        risks: input.assessment.risks,
        input_tokens: input.inputTokens,
        output_tokens: input.outputTokens,
        estimated_cost_usd: input.estimatedCostUsd,
        input_fingerprint: input.fingerprint,
        created_at: new Date().toISOString(),
      },
      { onConflict: "user_id,job_id,input_fingerprint" },
    )
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
