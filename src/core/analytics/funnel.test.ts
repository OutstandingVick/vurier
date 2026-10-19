import { describe, expect, it } from "vitest";
import { buildFunnel } from "./funnel";
describe("conversion funnel", () => {
  it("counts each application at its furthest confirmed stage", () => {
    const result = buildFunnel({
      discovered: 20,
      qualified: 10,
      proposals: 5,
      statuses: ["submitted", "viewed", "interviewing", "hired", "rejected"],
    });
    expect(result.map((item) => item.count)).toEqual([20, 10, 5, 5, 3, 2, 1]);
    expect(result[6].conversionFromPrior).toBe(50);
  });
  it("reports unavailable conversion when the prior stage is empty", () =>
    expect(
      buildFunnel({
        discovered: 0,
        qualified: 0,
        proposals: 0,
        statuses: [],
      })[1].conversionFromPrior,
    ).toBeNull());
  it("preserves stages reached before a later rejection", () => {
    const result = buildFunnel({ discovered: 1, qualified: 1, proposals: 1, statuses: ["rejected"], journeys: [["submitted", "viewed", "interviewing", "rejected"]] });
    expect(result.map((item) => item.count)).toEqual([1, 1, 1, 1, 1, 1, 0]);
  });
});
