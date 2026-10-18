import { describe, expect, it } from "vitest";
import { assertRunLimits } from "./limits";

const base = {
  dailyCost: 1,
  monthlyCost: 2,
  dailyLimit: 5,
  monthlyLimit: 10,
  analyzed: 1,
  maxJobs: 5,
};
describe("monitoring limits", () => {
  it("allows work inside all limits", () =>
    expect(() => assertRunLimits(base)).not.toThrow());
  it("pauses at daily and monthly limits", () => {
    expect(() => assertRunLimits({ ...base, dailyCost: 5 })).toThrow(/Daily/);
    expect(() => assertRunLimits({ ...base, monthlyCost: 10 })).toThrow(
      /Monthly/,
    );
  });
  it("caps jobs in one run", () =>
    expect(() => assertRunLimits({ ...base, analyzed: 5 })).toThrow(/Maximum/));
});
