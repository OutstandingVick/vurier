import { describe, expect, it } from "vitest";
import { batchProgress } from "@/core/opportunities/batch-progress";
describe("batch progress", () => {
  it("counts completed and failed attempts", () =>
    expect(batchProgress(10, 4, 1)).toBe(50));
  it("handles empty batches", () => expect(batchProgress(0, 0, 0)).toBe(0));
});
