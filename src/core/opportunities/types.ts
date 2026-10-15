export type OpportunityInput = {
  title: string;
  description: string;
  category?: string;
  budgetMin?: number;
  budgetMax?: number;
  connectsCost?: number;
};

export type OpportunityScore = {
  overall: number;
  fit: number;
  value: number;
  confidence: number;
  rationale: string[];
};
