import { describe, expect, it } from "vitest";
import { summarizeCosts } from "./costs";
describe("AI and research cost summaries", () => {
  it("separates confirmed and estimated costs", () => {
    const result = summarizeCosts(
      [
        {
          source: "deepseek",
          model: "flash",
          amountUsd: 1,
          estimated: true,
          occurredAt: "x",
        },
        { source: "research", amountUsd: 2, estimated: false, occurredAt: "x" },
      ],
      10,
    );
    expect(result).toMatchObject({
      total: 3,
      confirmed: 2,
      estimated: 1,
      budgetPercent: 30,
      overBudget: false,
    });
  });
  it("does not divide by a disabled budget", () =>
    expect(summarizeCosts([], 0).budgetPercent).toBeNull());
});
