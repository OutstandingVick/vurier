import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const sql = readFileSync(
  new URL(
    "./20261021000000_phase_7_portfolio_demo_intelligence.sql",
    import.meta.url,
  ),
  "utf8",
);
describe("Phase 7 migration", () => {
  it("persists strategies references assets and proposal links", () => {
    for (const table of [
      "demo_strategies",
      "demo_references",
      "demo_assets",
      "proposal_demo_assets",
    ])
      expect(sql).toContain(`public.${table}`);
  });
  it("enables RLS for every Phase 7 table", () =>
    expect(sql.match(/enable row level security/g)).toHaveLength(4));
  it("requires completed verified assets before attachment", () =>
    expect(sql).toContain("a.status='completed' and a.verified=true"));
  it("requires owned verified evidence and same-job attachments", () => {
    expect(sql).toContain("validate_demo_strategy_evidence");
    expect(sql).toContain("p.verified=true");
    expect(sql).toContain("s.job_id=p.job_id");
  });
  it("keeps demo files private and user scoped", () => {
    expect(sql).toContain("'demos','demos',false");
    expect(sql).toContain("demo_files_select_own");
  });
});
