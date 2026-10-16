export type PortfolioKind =
  | "project"
  | "writing_sample"
  | "achievement"
  | "experience"
  | "resume"
  | "link";
export type PortfolioEvidence = {
  id: string;
  title: string;
  description: string;
  kind: PortfolioKind;
  skills: string[];
  achievements: string[];
  projectUrl: string | null;
  repositoryUrl: string | null;
  filePath: string | null;
  verified: boolean;
};
export type EvidenceMatch = PortfolioEvidence & {
  relevance: number;
  matchedTerms: string[];
};
export type ProposalTone =
  "conversational" | "confident" | "technical" | "concise";
export type ProposalLength = "short" | "standard" | "detailed";
export type ProposalStrategy = {
  clientProblem: string;
  deliverables: string[];
  priorities: string[];
  risks: string[];
  differentiation: string[];
  positioning: string;
  proofIds: string[];
  suggestedBid: {
    amount: number | null;
    currency: string;
    basis: string;
    isEstimate: true;
  };
  timeline: { value: string; basis: string; isEstimate: true };
  demo: {
    recommended: boolean;
    type: string | null;
    scope: string | null;
    effort: string | null;
    expectedValue: string | null;
    references: string[];
  };
};
export type DraftContent = {
  coverLetter: string;
  openingLines: [string, string];
  closingQuestion: string;
  milestones: Array<{
    title: string;
    amount: number | null;
    timeline: string;
    isEstimate: true;
  }>;
  screeningAnswers: Array<{
    question: string;
    answer: string;
    unsupported: boolean;
  }>;
  attachmentIds: string[];
};
export type QaResult = {
  passed: boolean;
  scores: {
    personalization: number;
    factualAccuracy: number;
    relevance: number;
    clarity: number;
    clientFocus: number;
    style: number;
  };
  unsupportedClaims: string[];
  warnings: string[];
};
export type ProposalGenerationResult = {
  strategy: ProposalStrategy;
  draft: DraftContent;
  qa: QaResult;
  strategyTokens: number;
  draftTokens: number;
  estimatedCostUsd: number;
};
