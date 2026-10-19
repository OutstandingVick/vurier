import { describe, expect, it } from "vitest";
import { assertDemoBudget } from "./quota";
describe("demo AI quota", () => {
  it("reserves headroom before generation", () =>
    expect(() =>
      assertDemoBudget({ monthlySpent: 9.8, monthlyLimit: 10 }),
    ).toThrow(/exhausted/));
  it("allows work with budget remaining", () =>
    expect(() =>
      assertDemoBudget({ monthlySpent: 2, monthlyLimit: 10 }),
    ).not.toThrow());
});
