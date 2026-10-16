import type { ScoreFactor } from "@/core/opportunities/types";
export const FACTOR_LABELS: Record<ScoreFactor, string> = {
  skillMatch: "Skill match",
  portfolioRelevance: "Portfolio relevance",
  budgetValue: "Budget and value",
  competition: "Competition",
  clientCredibility: "Client credibility",
  recency: "Posting recency",
};
