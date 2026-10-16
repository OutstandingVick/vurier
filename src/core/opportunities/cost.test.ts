import { describe, expect, it } from "vitest";
import { estimateCostUsd } from "@/core/opportunities/cost";
describe("AI cost estimation", () => {
  it("tracks input and output prices separately", () =>
    expect(
      estimateCostUsd("deepseek-flash", {
        inputTokens: 1_000_000,
        outputTokens: 1_000_000,
        totalTokens: 2_000_000,
      }),
    ).toBe(0.3));
});
