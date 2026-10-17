import { describe, expect, it } from "vitest";
import { submissionIdempotencyKey } from "@/core/applications/idempotency";
describe("submission idempotency", () => {
  it("is stable per application version", () => {
    expect(submissionIdempotencyKey("u", "a", 1)).toBe(
      submissionIdempotencyKey("u", "a", 1),
    );
    expect(submissionIdempotencyKey("u", "a", 2)).not.toBe(
      submissionIdempotencyKey("u", "a", 1),
    );
  });
});
