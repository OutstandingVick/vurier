import { expect, it } from "vitest";
import { manualFallbackReason } from "@/core/applications/manual";
it("requires manual apply when permission or provider input is missing", () => {
  const value = { providerInput: null } as never;
  expect(manualFallbackReason(value, false)).toMatch(/permission/);
  expect(manualFallbackReason(value, true)).toMatch(/identifiers/);
});
