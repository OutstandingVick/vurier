import { describe, expect, it } from "vitest";
import { isAnalysisFresh } from "@/core/opportunities/cache";
describe("analysis cache", () => {
  it("reuses results inside the TTL", () =>
    expect(
      isAnalysisFresh(
        "2026-10-16T00:00:00Z",
        Date.parse("2026-10-16T23:59:00Z"),
      ),
    ).toBe(true));
  it("expires old results", () =>
    expect(
      isAnalysisFresh(
        "2026-10-15T00:00:00Z",
        Date.parse("2026-10-16T00:00:01Z"),
      ),
    ).toBe(false));
});
