import type { OpportunityInput, OpportunityScore } from "@/core/opportunities/types";

export interface OpportunityScorer {
  score(input: OpportunityInput, profileId: string): Promise<OpportunityScore>;
}

export class OpportunityScoringUnavailableError extends Error {
  constructor() {
    super("Opportunity scoring is reserved for Phase 2.");
    this.name = "OpportunityScoringUnavailableError";
  }
}
