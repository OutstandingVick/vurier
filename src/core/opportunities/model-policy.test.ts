import { describe, expect, it } from "vitest";
import { shouldRunDeepAnalysis } from "@/core/opportunities/model-policy";
describe("model escalation policy", () => {
  it("uses V4 Pro only for promising scores", () => {
    expect(shouldRunDeepAnalysis(true, 70)).toBe(true);
    expect(shouldRunDeepAnalysis(false, 90)).toBe(false);
    expect(shouldRunDeepAnalysis(true, 69)).toBe(false);
  });
});
