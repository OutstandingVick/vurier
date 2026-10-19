import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const sql = readFileSync(
  new URL("./20261022000000_phase_8_analytics_production.sql", import.meta.url),
  "utf8",
);
describe("Phase 8 migration", () => {
  it("adds outcome, expense, optimization, reliability, and reservation records", () => {
    for (const name of [
      "external_expenses",
      "ranking_adjustments",
      "operational_events",
      "integration_health",
      "connects_reservations",
      "ai_cost_reservations",
      "provider_rate_limits",
    ])
      expect(sql).toContain(`public.${name}`);
  });
  it("enables RLS for every new table", () =>
    expect(sql.match(/enable row level security/g)).toHaveLength(7));
  it("atomically locks and reserves connects before submission", () => {
    expect(sql).toContain("pg_advisory_xact_lock");
    expect(sql).toContain("Connects spending limit exceeded");
    expect(sql).toContain("finalize_connects_reservation");
  });
  it("atomically reserves AI spend before provider calls", () => {
    expect(sql).toContain("reserve_ai_cost");
    expect(sql).toContain("Monthly AI spending limit reached");
  });
  it("provides a durable service-only provider limiter", () => {
    expect(sql).toContain("consume_provider_rate_limit");
    expect(sql).toContain("Service role required");
  });
  it("atomically claims monitoring runs with expiring leases", () => {
    expect(sql).toContain("claim_monitoring_run");
    expect(sql).toContain("lease_expires_at");
  });
  it("indexes analytics date and status dimensions", () => {
    expect(sql).toContain("applications_user_created_status_idx");
    expect(sql).toContain("status_history_user_created_idx");
  });
  it("locks privileged workflow writes and validates tenant chains", () => {
    expect(sql).toContain("validate_owned_application_chain");
    expect(sql).toContain("validate_owned_proposal_job");
    expect(sql).toContain("revoke insert,update,delete on public.applications");
    expect(sql).toContain("discovery_source_status");
  });
});
