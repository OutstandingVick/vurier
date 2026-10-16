import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const sql = readFileSync(new URL("./20261018000000_phase_4_proposal_writer.sql", import.meta.url), "utf8");
describe("Phase 4 migration", () => { it("versions proposals and links verified evidence", () => { expect(sql).toContain("proposal_versions"); expect(sql).toContain("selected_evidence_ids"); expect(sql).toContain("verified boolean"); }); it("isolates proposal and upload data", () => { expect(sql).toContain("versions_all_own"); expect(sql).toContain("portfolio_files_insert_own"); expect(sql).toContain("auth.uid()"); }); });
