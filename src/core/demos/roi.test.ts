import { describe, expect, it } from "vitest";
import { calculateDemoRoi } from "./roi";

describe("demo ROI", () => {
  it("recommends building for strong economics and differentiation", () =>
    expect(
      calculateDemoRoi(
        {
          budget: 90,
          competition: 85,
          credibility: 80,
          urgency: 90,
          differentiation: 95,
          effort: 80,
        },
        false,
      ).decision,
    ).toBe("build"));
  it("recommends reuse when ROI is moderate and evidence exists", () =>
    expect(
      calculateDemoRoi(
        {
          budget: 55,
          competition: 50,
          credibility: 60,
          urgency: 50,
          differentiation: 55,
          effort: 55,
        },
        true,
      ).decision,
    ).toBe("reuse"));
  it("does not treat missing inputs as negative signals", () => {
    const result = calculateDemoRoi(
      {
        budget: null,
        competition: null,
        credibility: 80,
        urgency: null,
        differentiation: 90,
        effort: 80,
      },
      false,
    );
    expect(result.score).toBeGreaterThan(80);
    expect(result.unavailable).toContain("budget");
  });
});
