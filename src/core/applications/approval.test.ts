import { describe, expect, it } from "vitest";
import {
  assertValidApproval,
  createApprovalSnapshot,
} from "@/core/applications/approval";
import type { ApplicationPackage } from "@/core/applications/types";
const value: ApplicationPackage = {
  proposalId: "p",
  proposalVersionId: "v",
  jobId: "j",
  coverLetter: "text",
  bidAmount: 100,
  currency: "USD",
  connectsCost: 8,
  boostConnects: 0,
  milestones: [],
  deliveryEstimate: null,
  screeningAnswers: [],
  attachmentIds: [],
  directUrl: null,
  providerInput: null,
};
describe("application approval", () => {
  const secret = "a-secure-test-key-that-is-at-least-32-characters";
  it("binds approval to exact content and version", () => {
    const approval = createApprovalSnapshot("a", 1, value, secret, 0);
    expect(() =>
      assertValidApproval(approval, "a", 1, value, secret, 1),
    ).not.toThrow();
    expect(() =>
      assertValidApproval(
        approval,
        "a",
        1,
        { ...value, bidAmount: 120 },
        secret,
        1,
      ),
    ).toThrow(/exact/);
    expect(() =>
      assertValidApproval(approval, "a", 2, value, secret, 1),
    ).toThrow(/exact/);
  });
  it("expires approval", () =>
    expect(() =>
      assertValidApproval(
        createApprovalSnapshot("a", 1, value, secret, 0),
        "a",
        1,
        value,
        secret,
        16 * 60_000,
      ),
    ).toThrow(/expired/));

  it("rejects a forged approval signature", () => {
    const approval = createApprovalSnapshot("a", 1, value, secret, 0);
    expect(() =>
      assertValidApproval(
        { ...approval, signature: "0".repeat(64) },
        "a",
        1,
        value,
        secret,
        1,
      ),
    ).toThrow(/integrity/);
  });
});
