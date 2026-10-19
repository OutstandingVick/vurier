import type { DemoDecision, RoiAssessment, RoiFactors } from "./types";

const weights: Record<keyof RoiFactors, number> = {
  budget: 20,
  competition: 15,
  credibility: 15,
  urgency: 15,
  differentiation: 25,
  effort: 10,
};
export function calculateDemoRoi(
  factors: RoiFactors,
  hasReusableEvidence: boolean,
): RoiAssessment {
  const available = Object.entries(factors).filter(
    (entry): entry is [keyof RoiFactors, number] => entry[1] !== null,
  );
  const availableWeight = available.reduce(
    (sum, [factor]) => sum + weights[factor],
    0,
  );
  const score = availableWeight
    ? Math.round(
        available.reduce(
          (sum, [factor, value]) => sum + value * weights[factor],
          0,
        ) / availableWeight,
      )
    : 0;
  const confidence = Math.round((availableWeight / 100) * 100);
  let decision: DemoDecision =
    score >= 70
      ? "build"
      : score >= 48 && hasReusableEvidence
        ? "reuse"
        : "skip";
  if (
    factors.effort !== null &&
    factors.effort < 30 &&
    decision === "build" &&
    hasReusableEvidence
  )
    decision = "reuse";
  return {
    score,
    confidence,
    decision,
    factors,
    unavailable: Object.entries(factors)
      .filter(([, value]) => value === null)
      .map(([factor]) => factor),
  };
}
