import { describe, expect, it } from "vitest";
import { nextVersionNumber } from "@/core/proposals/versioning";
describe("proposal versions", () => {
  it("increments the highest persisted version", () =>
    expect(
      nextVersionNumber([{ version_number: 1 }, { version_number: 3 }]),
    ).toBe(4));
});
