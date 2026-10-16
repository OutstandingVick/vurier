export const SCORE_FACTORS = [
  "skillMatch",
  "portfolioRelevance",
  "budgetValue",
  "competition",
  "clientCredibility",
  "recency",
] as const;
export type ScoreFactor = (typeof SCORE_FACTORS)[number];
export type Recommendation = "apply" | "consider" | "skip";
export type ScoringWeights = Record<ScoreFactor, number>;
export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  skillMatch: 30,
  portfolioRelevance: 20,
  budgetValue: 15,
  competition: 15,
  clientCredibility: 10,
  recency: 10,
};
export type FactorAssessment = {
  score: number | null;
  explanation: string;
  evidence: string[];
  unavailableReason?: string;
};
export type FactorAssessments = Record<ScoreFactor, FactorAssessment>;
export type OpportunityInput = {
  id?: string;
  title: string;
  description: string;
  category?: string | null;
  skills?: string[];
  budgetMin?: number | null;
  budgetMax?: number | null;
  hourlyMin?: number | null;
  hourlyMax?: number | null;
  proposalCount?: string;
  clientPaymentVerification?: string;
  clientRating?: number | null;
  clientSpend?: number | null;
  publishedAt?: string | null;
};
export type MatchingProfile = {
  verifiedSkills: string[];
  experienceSummary: string;
  portfolio: Array<{ title: string; description: string; skills: string[] }>;
  preferredCategories: string[];
  minimumFixedBudget: number | null;
  minimumHourlyRate: number | null;
};
export type OpportunityScore = {
  overall: number;
  confidence: number;
  recommendation: Recommendation;
  factors: FactorAssessments;
  strengths: string[];
  gaps: string[];
  risks: string[];
  nextSteps: string[];
};
export type AnalysisRecord = OpportunityScore & {
  id: string;
  jobId: string;
  screeningModel: string;
  deepModel: string | null;
  modelVersion: string;
  weights: ScoringWeights;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
  createdAt: string;
  feedback: "accurate" | "inaccurate" | null;
};
