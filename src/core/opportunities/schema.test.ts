import { describe, expect, it } from "vitest";
import { aiAssessmentSchema } from "@/core/opportunities/schema";
const factor = { score: null, explanation: "Not provided", evidence: [] };
describe("AI assessment schema", () => {
  it("requires reasons for unavailable factors", () => {
    const result = aiAssessmentSchema.safeParse({
      factors: {
        skillMatch: factor,
        portfolioRelevance: factor,
        budgetValue: factor,
        competition: factor,
        clientCredibility: factor,
        recency: factor,
      },
      strengths: [],
      gaps: [],
      risks: [],
      nextSteps: [],
      confidence: 0,
      promising: false,
    });
    expect(result.success).toBe(false);
  });
});
