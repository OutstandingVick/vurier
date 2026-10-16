import { describe, expect, it } from "vitest";
import {
  calculateOpportunityScore,
  recommendationFor,
  validateWeights,
} from "@/core/opportunities/scorer";
import {
  DEFAULT_SCORING_WEIGHTS,
  type FactorAssessments,
} from "@/core/opportunities/types";
const factor = (score: number | null) => ({
  score,
  explanation: "Evidence-based",
  evidence: score === null ? [] : ["source"],
  ...(score === null ? { unavailableReason: "Not supplied" } : {}),
});
const all = (score: number | null): FactorAssessments => ({
  skillMatch: factor(score),
  portfolioRelevance: factor(score),
  budgetValue: factor(score),
  competition: factor(score),
  clientCredibility: factor(score),
  recency: factor(score),
});
describe("opportunity scoring", () => {
  it("applies the configured weights", () => {
    const factors = all(0);
    factors.skillMatch = factor(100);
    expect(calculateOpportunityScore(factors).overall).toBe(30);
  });
  it("renormalizes around unavailable facts", () => {
    const factors = all(null);
    factors.skillMatch = factor(80);
    factors.portfolioRelevance = factor(60);
    expect(calculateOpportunityScore(factors)).toMatchObject({
      overall: 72,
      confidence: 50,
      recommendation: "consider",
    });
  });
  it("does not count missing data as a negative signal", () => {
    expect(calculateOpportunityScore(all(null))).toEqual({
      overall: 0,
      confidence: 0,
      recommendation: "skip",
    });
  });
  it.each([
    [80, "apply"],
    [79, "consider"],
    [60, "consider"],
    [59, "skip"],
  ] as const)("classifies %i as %s", (score, expected) =>
    expect(recommendationFor(score)).toBe(expected),
  );
  it("rejects invalid totals", () =>
    expect(() =>
      validateWeights({ ...DEFAULT_SCORING_WEIGHTS, recency: 9 }),
    ).toThrow(/total 100/));
});
