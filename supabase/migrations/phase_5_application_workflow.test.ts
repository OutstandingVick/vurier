import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const sql = readFileSync(
  new URL("./20261019000000_phase_5_application_workflow.sql", import.meta.url),
  "utf8",
);
describe("Phase 5 migration", () => {
  it("persists approvals attempts spending history and audits", () => {
    for (const table of [
      "application_approvals",
      "submission_attempts",
      "connects_ledger",
      "application_status_history",
      "application_audit_logs",
    ])
      expect(sql).toContain(table);
  });
  it("prevents duplicate job applications", () =>
    expect(sql).toContain("applications_user_job_unique"));
  it("isolates workflow records", () =>
    expect(
      sql.match(/enable row level security/g)?.length,
    ).toBeGreaterThanOrEqual(6));
  it("requires signed approvals and non-negative spending", () => {
    expect(sql).toContain("signature text not null");
    expect(sql).toContain("check (amount >= 0)");
  });
});
