import { describe, expect, it } from "vitest";
import { analysisFingerprint } from "@/core/opportunities/fingerprint";
describe("analysis fingerprint", () => {
  it("is stable for identical inputs and changes with evidence", () => {
    const first = analysisFingerprint({ job: 1, skills: ["React"] });
    expect(analysisFingerprint({ job: 1, skills: ["React"] })).toBe(first);
    expect(analysisFingerprint({ job: 1, skills: ["Rust"] })).not.toBe(first);
  });
});
