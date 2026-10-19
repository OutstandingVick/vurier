import { describe, expect, it } from "vitest";
import { applyBoundedScore, boundedAdjustments } from "./optimization";
describe("feedback optimization", () => {
  it("requires enough outcomes and bounds adjustments", () => {
    const signals = Array.from({ length: 10 }, () => ({
      factor: "frontend",
      recommended: true,
      outcome: "hired" as const,
    }));
    expect(boundedAdjustments(signals, true, 1)[0]).toMatchObject({
      adjustment: 1,
      sampleSize: 10,
    });
  });
  it("can be disabled and cannot exceed score bounds", () => {
    expect(
      boundedAdjustments(
        [{ factor: "x", recommended: true, outcome: "hired" }],
        false,
      ),
    ).toEqual([]);
    expect(applyBoundedScore(99, [{ adjustment: 5 }])).toBe(100);
  });
});
