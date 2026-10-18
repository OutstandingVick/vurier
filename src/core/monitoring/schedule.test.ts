import { describe, expect, it } from "vitest";
import { cronForInterval, nextRunAt } from "./schedule";

describe("monitoring schedules", () => {
  it.each([
    ["15m", "*/15 * * * *"],
    ["30m", "*/30 * * * *"],
    ["hourly", "0 * * * *"],
    ["daily", "0 8 * * *"],
  ] as const)("maps %s to cron", (interval, cron) =>
    expect(cronForInterval(interval)).toBe(cron),
  );
  it("calculates a stable next interval", () =>
    expect(
      nextRunAt("30m", new Date("2026-10-18T10:00:00Z")).toISOString(),
    ).toBe("2026-10-18T10:30:00.000Z"));
});
