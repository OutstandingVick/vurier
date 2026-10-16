import { z } from "zod";
const estimate = z.object({
  amount: z.number().nonnegative().nullable(),
  currency: z.string().length(3),
  basis: z.string().min(1).max(400),
  isEstimate: z.literal(true),
});
export const proposalStrategySchema = z.object({
  clientProblem: z.string().min(1).max(800),
  deliverables: z.array(z.string().max(300)).max(10),
  priorities: z.array(z.string().max(300)).max(8),
  risks: z.array(z.string().max(300)).max(8),
  differentiation: z.array(z.string().max(300)).max(8),
  positioning: z.string().min(1).max(800),
  proofIds: z.array(z.string().uuid()).max(8),
  suggestedBid: estimate,
  timeline: z.object({
    value: z.string().min(1).max(200),
    basis: z.string().min(1).max(400),
    isEstimate: z.literal(true),
  }),
  demo: z.object({
    recommended: z.boolean(),
    type: z.string().max(100).nullable(),
    scope: z.string().max(500).nullable(),
    effort: z.string().max(200).nullable(),
    expectedValue: z.string().max(500).nullable(),
    references: z.array(z.string().url()).max(5),
  }),
});
export const draftContentSchema = z.object({
  coverLetter: z.string().min(80).max(6000),
  openingLines: z.tuple([z.string().min(1), z.string().min(1)]),
  closingQuestion: z
    .string()
    .min(1)
    .max(400)
    .refine(
      (value) => value.trim().endsWith("?"),
      "Proposal must end with a question.",
    ),
  milestones: z
    .array(
      z.object({
        title: z.string().min(1),
        amount: z.number().nonnegative().nullable(),
        timeline: z.string().min(1),
        isEstimate: z.literal(true),
      }),
    )
    .max(8),
  screeningAnswers: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
        unsupported: z.boolean(),
      }),
    )
    .max(12),
  attachmentIds: z.array(z.string().uuid()).max(8),
});
