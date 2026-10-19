import type { SupabaseClient } from "@supabase/supabase-js";
import type { RoiAssessment } from "./types";

export async function findCachedDemoStrategy(
  client: SupabaseClient,
  userId: string,
  jobId: string,
  fingerprint: string,
) {
  const { data, error } = await client
    .from("demo_strategies")
    .select("*")
    .eq("user_id", userId)
    .eq("job_id", jobId)
    .eq("input_fingerprint", fingerprint)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveDemoStrategy(
  client: SupabaseClient,
  input: {
    userId: string;
    jobId: string;
    fingerprint: string;
    result: Record<string, unknown>;
    roi: RoiAssessment;
    selectedEvidenceIds: string[];
    usage: {
      strategyInput: number;
      strategyOutput: number;
      artifactInput: number;
      artifactOutput: number;
    };
    models: { strategy: string; artifact: string };
    estimatedCostUsd: number;
  },
) {
  const { data, error } = await client
    .from("demo_strategies")
    .upsert(
      {
        user_id: input.userId,
        job_id: input.jobId,
        input_fingerprint: input.fingerprint,
        decision: input.roi.decision,
        demo_kind: input.result.kind,
        roi_score: input.roi.score,
        roi_confidence: input.roi.confidence,
        roi_factors: input.roi.factors,
        unavailable_factors: input.roi.unavailable,
        client_problem: input.result.clientProblem,
        rationale: input.result.rationale,
        risks: input.result.risks,
        selected_evidence_ids: input.selectedEvidenceIds,
        reuse_candidate_id: input.result.reuseCandidateId,
        brief: input.result.brief,
        implementation_prompt: input.result.implementationPrompt,
        strategy_model: input.models.strategy,
        artifact_model: input.models.artifact,
        input_tokens: input.usage.strategyInput + input.usage.artifactInput,
        output_tokens: input.usage.strategyOutput + input.usage.artifactOutput,
        estimated_cost_usd: input.estimatedCostUsd,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,job_id,input_fingerprint" },
    )
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
