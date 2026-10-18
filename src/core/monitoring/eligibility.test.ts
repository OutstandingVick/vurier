import { describe, expect, it } from "vitest";
import { isAlertEligible } from "./eligibility";

const base = {
  score: 85,
  threshold: 80,
  budgetMin: 2_000,
  hourlyMin: null,
  preferredFixed: 1_000,
  preferredHourly: 50,
};
describe("alert eligibility", () => {
  it("requires score and available budget signals to pass", () =>
    expect(isAlertEligible(base)).toBe(true));
  it("rejects known low budgets", () =>
    expect(isAlertEligible({ ...base, budgetMin: 500 })).toBe(false));
  it("does not penalize unavailable budgets", () =>
    expect(isAlertEligible({ ...base, budgetMin: null })).toBe(true));
});
