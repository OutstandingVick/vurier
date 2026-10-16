import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
const sql = readFileSync(new URL("./20261017000000_phase_3_opportunity_intelligence.sql", import.meta.url), "utf8");
describe("Phase 3 migration", () => {
  it("persists factors, model lineage, feedback, and usage", () => { for (const field of ["factor_scores", "scoring_weights", "screening_model", "deep_model", "estimated_cost_usd", "feedback", "input_fingerprint"]) expect(sql).toContain(field); });
  it("preserves user isolation through ownership validation", () => { expect(sql).toContain("validate_analysis_ownership"); expect(sql).toContain("user_id = new.user_id"); });
  it("prevents duplicate analyses and active batches", () => { expect(sql).toContain("job_analyses_fingerprint_unique"); expect(sql).toContain("agent_runs_one_active_analysis"); });
});
