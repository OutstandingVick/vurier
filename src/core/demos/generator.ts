import { deepSeek } from "@/lib/ai/deepseek";
import { demoArtifactSchema, demoStrategyAssessmentSchema } from "./schema";
import { artifactMessages, strategyMessages } from "./prompts";
import { calculateDemoRoi } from "./roi";
import { demoGenerationCost } from "./cost";
import type { DemoKind, RankedEvidence, RoiFactors } from "./types";

export async function generateDemoStrategy(input: {
  job: unknown;
  analysis: unknown;
  evidence: RankedEvidence[];
  expectedKind: DemoKind;
  roiSignals: Omit<RoiFactors, "differentiation" | "effort">;
}) {
  const strategic = await deepSeek.generate({
    model: "deepseek-v4-pro",
    reasoning: "high",
    messages: strategyMessages(input),
    schema: demoStrategyAssessmentSchema,
  });
  const knownIds = new Set(input.evidence.map((item) => item.id));
  const reuseCandidateId =
    strategic.data.reuseCandidateId &&
    knownIds.has(strategic.data.reuseCandidateId)
      ? strategic.data.reuseCandidateId
      : null;
  const selected = input.evidence.filter((item) =>
    strategic.data.selectedEvidenceIds.includes(item.id),
  );
  const sanitizedStrategy = {
    ...strategic.data,
    kind: input.expectedKind,
    reuseCandidateId,
    selectedEvidenceIds: selected.map((item) => item.id),
  };
  const roi = calculateDemoRoi(
    {
      ...input.roiSignals,
      differentiation: strategic.data.differentiationScore,
      effort: strategic.data.effortScore,
    },
    Boolean(reuseCandidateId),
  );
  const artifact = await deepSeek.generate({
    model: "deepseek-flash",
    reasoning: "medium",
    messages: artifactMessages({
      job: input.job,
      strategy: { ...sanitizedStrategy, roi },
      evidence: selected,
    }),
    schema: demoArtifactSchema,
  });
  return {
    strategy: { ...sanitizedStrategy, ...artifact.data },
    roi,
    selectedEvidence: selected,
    usage: {
      strategyInput: strategic.usage.inputTokens,
      strategyOutput: strategic.usage.outputTokens,
      artifactInput: artifact.usage.inputTokens,
      artifactOutput: artifact.usage.outputTokens,
    },
    estimatedCostUsd: demoGenerationCost(strategic.usage, artifact.usage),
    models: { strategy: strategic.model, artifact: artifact.model },
  };
}
