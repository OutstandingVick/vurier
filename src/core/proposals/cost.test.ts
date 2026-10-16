import { describe, expect, it } from "vitest";
import { proposalCost } from "@/core/proposals/cost";
describe("proposal costs", () => {
  it("accounts for strategy and draft models", () =>
    expect(
      proposalCost(
        { inputTokens: 1_000_000, outputTokens: 0, totalTokens: 1_000_000 },
        { inputTokens: 1_000_000, outputTokens: 0, totalTokens: 1_000_000 },
      ),
    ).toBe(0.6));
});
