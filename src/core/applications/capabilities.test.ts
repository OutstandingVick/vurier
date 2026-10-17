import { describe, expect, it } from "vitest";
import { upworkCapabilities } from "@/core/applications/capabilities";
describe("Upwork capabilities", () => {
  it("never assumes ungranted permissions", () =>
    expect(upworkCapabilities([])).toEqual({
      canSubmit: false,
      canReadConnects: false,
      canTrackStatus: false,
    }));
});
