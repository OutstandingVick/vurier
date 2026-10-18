import { describe, expect, it } from "vitest";
import { monitoringRunKey } from "./idempotency";

describe("monitoring idempotency", () => {
  it("is stable for one schedule occurrence", () =>
    expect(monitoringRunKey("schedule", new Date(0))).toBe(
      monitoringRunKey("schedule", new Date(0)),
    ));
  it("changes for later occurrences", () =>
    expect(monitoringRunKey("schedule", new Date(0))).not.toBe(
      monitoringRunKey("schedule", new Date(1)),
    ));
});
