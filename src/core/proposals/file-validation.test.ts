import { describe, expect, it } from "vitest";
import { validateEvidenceFile } from "@/core/proposals/file-validation";
describe("portfolio file validation", () => {
  it("accepts supported files within the limit", () =>
    expect(
      validateEvidenceFile({ size: 100, type: "application/pdf" }),
    ).toBeNull());
  it("rejects unsupported and oversized files", () => {
    expect(validateEvidenceFile({ size: 100, type: "image/png" })).toMatch(
      /PDF/,
    );
    expect(
      validateEvidenceFile({ size: 11 * 1024 * 1024, type: "application/pdf" }),
    ).toMatch(/10 MB/);
  });
});
