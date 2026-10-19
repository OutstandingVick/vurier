import { describe, expect, it } from "vitest";
import { validateDemoFile } from "./file-validation";
describe("demo file validation", () => {
  it("accepts supported files", () =>
    expect(
      validateDemoFile({ size: 1_000, type: "application/pdf" }),
    ).toBeNull());
  it("rejects large or executable files", () => {
    expect(
      validateDemoFile({ size: 16 * 1024 * 1024, type: "application/pdf" }),
    ).toMatch(/15 MB/);
    expect(
      validateDemoFile({ size: 1_000, type: "application/javascript" }),
    ).toMatch(/PDF/);
  });
});
