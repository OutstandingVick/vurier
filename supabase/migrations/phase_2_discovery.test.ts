import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync(new URL("./20261016000000_phase_2_discovery.sql", import.meta.url), "utf8");

describe("Phase 2 database isolation", () => {
  it("enables RLS on every new user-owned table", () => {
    for (const table of ["discovery_sources", "saved_searches", "job_user_states"]) expect(sql).toContain(`alter table public.${table} enable row level security`);
  });
  it("scopes policies to auth.uid and protects integration token writes", () => {
    expect(sql.match(/auth\.uid\(\)/g)?.length).toBeGreaterThanOrEqual(10);
    expect(sql).toContain("revoke insert, update, delete on public.discovery_sources from authenticated");
  });
  it("enforces stable provider IDs per user", () => {
    expect(sql).toContain("jobs_user_source_external_unique");
  });
});
