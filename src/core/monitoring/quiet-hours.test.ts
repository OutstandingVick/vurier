import { describe, expect, it } from "vitest";
import { isQuietTime } from "./quiet-hours";

describe("quiet hours", () => {
  it("handles an overnight range in the configured timezone", () => {
    expect(
      isQuietTime({
        now: new Date("2026-10-18T22:30:00Z"),
        timezone: "Africa/Lagos",
        start: "22:00",
        end: "07:00",
      }),
    ).toBe(true);
    expect(
      isQuietTime({
        now: new Date("2026-10-18T10:00:00Z"),
        timezone: "Africa/Lagos",
        start: "22:00",
        end: "07:00",
      }),
    ).toBe(false);
  });
  it("treats equal or missing endpoints as disabled", () =>
    expect(isQuietTime({ timezone: "UTC", start: "22:00", end: "22:00" })).toBe(
      false,
    ));
});
