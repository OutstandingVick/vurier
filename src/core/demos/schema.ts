import { z } from "zod";
import { DEMO_KINDS } from "./types";

export const demoStrategyAssessmentSchema = z.object({
  kind: z.enum(DEMO_KINDS),
  clientProblem: z.string().min(1).max(1_000),
  rationale: z.array(z.string().min(1).max(400)).min(1).max(8),
  risks: z.array(z.string().min(1).max(400)).max(8),
  selectedEvidenceIds: z.array(z.string().uuid()).max(8),
  differentiationScore: z.number().min(0).max(100),
  effortScore: z.number().min(0).max(100),
  reuseCandidateId: z.string().uuid().nullable(),
});

export const demoArtifactSchema = z.object({
  brief: z.object({
    objective: z.string().min(1).max(1_000),
    essentialFeatures: z.array(z.string().min(1).max(300)).min(1).max(10),
    technologies: z.array(z.string().min(1).max(100)).max(12),
    scopeBoundaries: z.array(z.string().min(1).max(300)).min(1).max(10),
    deliverables: z.array(z.string().min(1).max(300)).min(1).max(10),
    acceptanceCriteria: z.array(z.string().min(1).max(300)).min(1).max(12),
    estimatedEffortHours: z.number().nonnegative().max(160).nullable(),
  }),
  implementationPrompt: z.string().min(80).max(8_000),
});
