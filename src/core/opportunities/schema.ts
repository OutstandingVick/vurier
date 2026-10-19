import { z } from "zod";
const assessment = z
  .object({
    score: z.number().min(0).max(100).nullable(),
    explanation: z.string().min(1).max(500),
    evidence: z.array(z.string().max(240)).max(8),
    unavailableReason: z.string().max(240).optional(),
  })
  .refine((value) => value.score !== null || value.unavailableReason, {
    message: "Unavailable factors require a reason.",
  });
export const aiAssessmentSchema = z.object({
  factors: z.object({
    skillMatch: assessment,
    portfolioRelevance: assessment,
    budgetValue: assessment,
    competition: assessment,
    clientCredibility: assessment,
    recency: assessment,
  }),
  strengths: z.array(z.string().max(300)).max(6),
  gaps: z.array(z.string().max(300)).max(6),
  risks: z.array(z.string().max(300)).max(6),
  nextSteps: z.array(z.string().max(300)).max(5),
  confidence: z.number().min(0).max(100),
  promising: z.boolean(),
});
export type AiAssessment = z.infer<typeof aiAssessmentSchema>;
