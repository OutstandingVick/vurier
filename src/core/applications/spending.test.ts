import { describe, expect, it } from "vitest";
import { assertSpendingAllowed } from "@/core/applications/spending";
describe("Connects limits", () => {
  it("calculates remaining balance", () =>
    expect(
      assertSpendingAllowed(
        8,
        2,
        { daily: 0, monthly: 0, available: 20 },
        { daily: 20, monthly: 50 },
      ).estimatedRemaining,
    ).toBe(10));
  it("blocks missing cost and exceeded limits", () => {
    expect(() =>
      assertSpendingAllowed(
        null,
        0,
        { daily: 0, monthly: 0, available: null },
        { daily: 20, monthly: 50 },
      ),
    ).toThrow(/unavailable/);
    expect(() =>
      assertSpendingAllowed(
        8,
        3,
        { daily: 10, monthly: 10, available: 50 },
        { daily: 20, monthly: 50 },
      ),
    ).toThrow(/Daily/);
  });
});
