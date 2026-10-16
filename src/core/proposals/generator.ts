import { deepSeek } from "@/lib/ai/deepseek";
import {
  draftContentSchema,
  proposalStrategySchema,
} from "@/core/proposals/schema";
import { draftMessages, strategyMessages } from "@/core/proposals/prompts";
import { proposalCost } from "@/core/proposals/cost";
import { validateProposal } from "@/core/proposals/qa";
import type {
  EvidenceMatch,
  PortfolioEvidence,
  ProposalGenerationResult,
  ProposalLength,
  ProposalTone,
} from "@/core/proposals/types";
export async function generateProposal(input: {
  job: unknown;
  jobText: string;
  analysis: unknown;
  evidence: EvidenceMatch[];
  tone?: ProposalTone;
  length?: ProposalLength;
}): Promise<ProposalGenerationResult> {
  const strategy = await deepSeek.generate({
    model: "deepseek-v4-pro",
    reasoning: "high",
    messages: strategyMessages({
      job: input.job,
      analysis: input.analysis,
      evidence: input.evidence,
    }),
    schema: proposalStrategySchema,
  });
  const selected = input.evidence.filter((item) =>
    strategy.data.proofIds.includes(item.id),
  );
  const draft = await deepSeek.generate({
    model: "deepseek-flash",
    reasoning: "medium",
    messages: draftMessages({
      job: input.job,
      strategy: strategy.data,
      evidence: selected,
      tone: input.tone ?? "conversational",
      length: input.length ?? "standard",
    }),
    schema: draftContentSchema,
  });
  const qa = validateProposal(
    draft.data,
    selected as PortfolioEvidence[],
    input.jobText,
  );
  return {
    strategy: strategy.data,
    draft: draft.data,
    qa,
    strategyTokens: strategy.usage.totalTokens,
    draftTokens: draft.usage.totalTokens,
    estimatedCostUsd: proposalCost(strategy.usage, draft.usage),
  };
}
export async function rewriteProposal(input: {
  job: unknown;
  strategy: Parameters<typeof draftMessages>[0]["strategy"];
  evidence: EvidenceMatch[];
  previousDraft: string;
  tone: ProposalTone;
  length: ProposalLength;
}) {
  return deepSeek.generate({
    model: "deepseek-flash",
    reasoning: "medium",
    messages: draftMessages(input),
    schema: draftContentSchema,
  });
}
