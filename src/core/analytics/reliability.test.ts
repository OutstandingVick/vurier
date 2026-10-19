import { describe, expect, it } from "vitest";
import { reliabilitySummary } from "./reliability";
describe("reliability summary", () => {
  it("reports failed runs and uncertain submissions", () => {
    const result = reliabilitySummary(
      {
        runs: [{ status: "completed" }, { status: "failed" }],
        attempts: [{ status: "uncertain" }],
        errors: [{ created_at: "2026-10-19T00:00:00Z" }],
        integrations: [],
      },
      new Date("2026-10-20T00:00:00Z"),
    );
    expect(result).toMatchObject({
      monitoringSuccessRate: 50,
      failedRuns: 1,
      unresolvedSubmissionAttempts: 1,
      recentErrors: 1,
    });
  });
});
