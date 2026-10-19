import type { SupabaseClient } from "@supabase/supabase-js";
import {
  aiAssessmentSchema,
  type AiAssessment,
} from "@/core/opportunities/schema";
import {
  calculateOpportunityScore,
  recommendationFor,
} from "@/core/opportunities/scorer";
import { buildAnalysisMessages } from "@/core/opportunities/prompt";
import { estimateCostUsd } from "@/core/opportunities/cost";
import { analysisFingerprint } from "@/core/opportunities/fingerprint";
import { assertWithinUsageLimits } from "@/core/opportunities/quota";
import {
  findFreshAnalysis,
  getUsage,
  saveAnalysis,
} from "@/core/opportunities/repository";
import type {
  MatchingProfile,
  OpportunityInput,
  ScoringWeights,
} from "@/core/opportunities/types";
import { deepSeek } from "@/lib/ai/deepseek";
import { shouldRunDeepAnalysis } from "@/core/opportunities/model-policy";
import { applyBoundedScore } from "@/core/analytics/optimization";
import { releaseAiCost, reserveAiCost } from "@/core/analytics/ai-reservation";

export async function analyzeOpportunity(input: {
  client: SupabaseClient;
  userId: string;
  job: OpportunityInput;
  profile: MatchingProfile;
  weights: ScoringWeights;
  limits: { dailyAnalyses: number; monthlyCostUsd: number };
  force?: boolean;
  signal?: AbortSignal;
  adjustments?: Array<{ adjustment: number; explanation: string }>;
}) {
  const fingerprint = analysisFingerprint({
    job: input.job,
    profile: input.profile,
    weights: input.weights,
    adjustments: input.adjustments ?? [],
    version: "phase3-v1",
  });
  if (!input.force && input.job.id) {
    const cached = await findFreshAnalysis(
      input.client,
      input.userId,
      input.job.id,
      fingerprint,
    );
    if (cached) return { analysis: cached, cached: true };
  }
  assertWithinUsageLimits(
    await getUsage(input.client, input.userId),
    input.limits,
  );
  const reservationId = await reserveAiCost(
    input.client,
    input.userId,
    "opportunity_analysis",
  );
  try {
    const screening = await deepSeek.generate<AiAssessment>({
      model: "deepseek-flash",
      reasoning: "low",
      messages: buildAnalysisMessages(input.job, input.profile, "screen"),
      schema: aiAssessmentSchema,
      signal: input.signal,
    });
    const screenScore = calculateOpportunityScore(
      screening.data.factors,
      input.weights,
    );
    let final = screening;
    let deepModel: string | null = null;
    if (shouldRunDeepAnalysis(screening.data.promising, screenScore.overall)) {
      final = await deepSeek.generate<AiAssessment>({
        model: "deepseek-v4-pro",
        reasoning: "high",
        messages: buildAnalysisMessages(input.job, input.profile, "deep"),
        schema: aiAssessmentSchema,
        signal: input.signal,
      });
      deepModel = final.model;
    }
    const baseScore = calculateOpportunityScore(
      final.data.factors,
      input.weights,
    );
    const adjustedOverall = applyBoundedScore(
      baseScore.overall,
      input.adjustments ?? [],
    );
    const score = {
      ...baseScore,
      overall: adjustedOverall,
      recommendation: recommendationFor(adjustedOverall),
    };
    const usage = {
      inputTokens:
        screening.usage.inputTokens +
        (final === screening ? 0 : final.usage.inputTokens),
      outputTokens:
        screening.usage.outputTokens +
        (final === screening ? 0 : final.usage.outputTokens),
      totalTokens:
        screening.usage.totalTokens +
        (final === screening ? 0 : final.usage.totalTokens),
    };
    const estimatedCostUsd =
      estimateCostUsd(screening.model, screening.usage) +
      (final === screening ? 0 : estimateCostUsd(final.model, final.usage));
    if (!input.job.id)
      throw new Error("A persisted job is required for analysis.");
    const analysis = await saveAnalysis(input.client, {
      userId: input.userId,
      jobId: input.job.id,
      assessment: final.data,
      ...score,
      weights: input.weights,
      screeningModel: screening.model,
      deepModel,
      fingerprint,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      estimatedCostUsd,
      baseScore: baseScore.overall,
      optimizationAdjustment: adjustedOverall - baseScore.overall,
      adjustmentExplanations: (input.adjustments ?? []).map(
        (item) => item.explanation,
      ),
    });
    await releaseAiCost(input.client, input.userId, reservationId);
    return { analysis, cached: false };
  } catch (error) {
    await releaseAiCost(input.client, input.userId, reservationId).catch(
      () => undefined,
    );
    throw error;
  }
}
