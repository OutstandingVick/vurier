export { analyzeOpportunity } from "@/core/opportunities/analyzer";
export {
  calculateOpportunityScore,
  recommendationFor,
  validateWeights,
} from "@/core/opportunities/scorer";
export {
  DEFAULT_SCORING_WEIGHTS,
  SCORE_FACTORS,
} from "@/core/opportunities/types";
export type {
  AnalysisRecord,
  FactorAssessments,
  MatchingProfile,
  OpportunityInput,
  OpportunityScore,
  Recommendation,
  ScoringWeights,
} from "@/core/opportunities/types";
