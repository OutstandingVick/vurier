import {
  DEFAULT_SCORING_WEIGHTS,
  SCORE_FACTORS,
  type FactorAssessments,
  type OpportunityScore,
  type Recommendation,
  type ScoringWeights,
} from "@/core/opportunities/types";
import { RECOMMENDATION_THRESHOLDS } from "@/core/opportunities/thresholds";
export function validateWeights(weights: ScoringWeights): ScoringWeights {
  const values = SCORE_FACTORS.map((factor) => weights[factor]);
  if (
    values.some((value) => !Number.isFinite(value) || value < 0) ||
    Math.abs(values.reduce((a, b) => a + b, 0) - 100) > 0.001
  )
    throw new Error("Scoring weights must be non-negative and total 100.");
  return weights;
}
export function recommendationFor(score: number): Recommendation {
  return score >= RECOMMENDATION_THRESHOLDS.apply
    ? "apply"
    : score >= RECOMMENDATION_THRESHOLDS.consider
      ? "consider"
      : "skip";
}
export function calculateOpportunityScore(
  factors: FactorAssessments,
  weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS,
): Pick<OpportunityScore, "overall" | "confidence" | "recommendation"> {
  validateWeights(weights);
  const available = SCORE_FACTORS.filter(
    (factor) => factors[factor].score !== null,
  );
  if (!available.length)
    return { overall: 0, confidence: 0, recommendation: "skip" };
  const availableWeight = available.reduce(
    (sum, factor) => sum + weights[factor],
    0,
  );
  const weighted =
    available.reduce(
      (sum, factor) => sum + (factors[factor].score ?? 0) * weights[factor],
      0,
    ) / availableWeight;
  const overall = Math.round(Math.max(0, Math.min(100, weighted)));
  return {
    overall,
    confidence: Math.round(availableWeight),
    recommendation: recommendationFor(overall),
  };
}
export interface OpportunityScorer {
  score(
    factors: FactorAssessments,
    weights?: ScoringWeights,
  ): Pick<OpportunityScore, "overall" | "confidence" | "recommendation">;
}
export class DeterministicOpportunityScorer implements OpportunityScorer {
  score(factors: FactorAssessments, weights?: ScoringWeights) {
    return calculateOpportunityScore(factors, weights);
  }
}
