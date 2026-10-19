import { describe, expect, it } from "vitest";
import { comparison, inWindow, resolveDateWindow } from "./date-range";
describe("analytics date windows", () => {
  it("creates equal current and comparison periods", () => {
    const result = resolveDateWindow("7d", new Date("2026-10-20T00:00:00Z"));
    expect(result.from.toISOString()).toBe("2026-10-13T00:00:00.000Z");
    expect(result.previousFrom.toISOString()).toBe("2026-10-06T00:00:00.000Z");
  });
  it("uses half-open date windows", () => {
    const from = new Date("2026-10-01T00:00:00Z");
    const to = new Date("2026-11-01T00:00:00Z");
    expect(inWindow("2026-10-01T00:00:00Z", from, to)).toBe(true);
    expect(inWindow("2026-11-01T00:00:00Z", from, to)).toBe(false);
  });
  it("does not invent a percentage from a zero baseline", () =>
    expect(comparison(3, 0).changePercent).toBeNull());
});
