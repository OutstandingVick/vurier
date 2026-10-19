import { describe, expect, it } from "vitest";
import { canAdvanceProposal } from "@/core/proposals/workflow";
describe("proposal workflow", () => {
  it("requires each grounded workflow stage", () => {
    expect(canAdvanceProposal("analysis", "strategy")).toBe(true);
    expect(canAdvanceProposal("evidence", "draft")).toBe(false);
  });
});
