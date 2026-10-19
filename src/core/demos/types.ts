import type { PortfolioEvidence } from "@/core/proposals/types";

export const DEMO_DECISIONS = ["build", "reuse", "skip"] as const;
export type DemoDecision = (typeof DEMO_DECISIONS)[number];
export const DEMO_KINDS = [
  "prototype",
  "technical_audit",
  "research_report",
  "writing_sample",
  "content_strategy",
] as const;
export type DemoKind = (typeof DEMO_KINDS)[number];
export type RankedEvidence = PortfolioEvidence & {
  relevance: number;
  reasons: string[];
};
export type RoiFactors = {
  budget: number | null;
  competition: number | null;
  credibility: number | null;
  urgency: number | null;
  differentiation: number | null;
  effort: number | null;
};
export type RoiAssessment = {
  score: number;
  confidence: number;
  decision: DemoDecision;
  factors: RoiFactors;
  unavailable: string[];
};
export type DemoBrief = {
  objective: string;
  essentialFeatures: string[];
  technologies: string[];
  scopeBoundaries: string[];
  deliverables: string[];
  acceptanceCriteria: string[];
  estimatedEffortHours: number | null;
};
export type DemoStrategy = {
  kind: DemoKind;
  clientProblem: string;
  rationale: string[];
  risks: string[];
  selectedEvidenceIds: string[];
  differentiationScore: number;
  effortScore: number;
  reuseCandidateId: string | null;
  brief: DemoBrief;
  implementationPrompt: string;
};
