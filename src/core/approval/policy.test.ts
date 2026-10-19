import { describe, expect, it } from "vitest";
import { assertApproval } from "@/core/approval/policy";

describe("approval policy", () => {
  it("blocks guarded actions without matching approval", () => {
    expect(() =>
      assertApproval(undefined, "submit_proposal", "proposal-1"),
    ).toThrow("Explicit user approval");
    expect(() =>
      assertApproval(
        {
          action: "spend_connects",
          resourceId: "proposal-1",
          userId: "user-1",
          approvedAt: new Date(),
        },
        "submit_proposal",
        "proposal-1",
      ),
    ).toThrow("Explicit user approval");
  });

  it("allows the approved action for the approved resource", () => {
    expect(() =>
      assertApproval(
        {
          action: "submit_proposal",
          resourceId: "proposal-1",
          userId: "user-1",
          approvedAt: new Date(),
        },
        "submit_proposal",
        "proposal-1",
      ),
    ).not.toThrow();
  });
});
