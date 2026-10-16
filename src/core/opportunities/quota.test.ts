import { describe, expect, it } from "vitest";
import { assertWithinUsageLimits } from "@/core/opportunities/quota";
describe("usage limits", () => {
  it("allows usage below limits", () =>
    expect(() =>
      assertWithinUsageLimits(
        { analyses: 4, estimatedCostUsd: 1 },
        { dailyAnalyses: 5, monthlyCostUsd: 2 },
      ),
    ).not.toThrow());
  it("blocks analysis and spending limits", () => {
    expect(() =>
      assertWithinUsageLimits(
        { analyses: 5, estimatedCostUsd: 0 },
        { dailyAnalyses: 5, monthlyCostUsd: 2 },
      ),
    ).toThrow(/Daily/);
    expect(() =>
      assertWithinUsageLimits(
        { analyses: 0, estimatedCostUsd: 2 },
        { dailyAnalyses: 5, monthlyCostUsd: 2 },
      ),
    ).toThrow(/Monthly/);
  });
});
