import type {
  ApprovalSnapshot,
  ApplicationPackage,
} from "@/core/applications/types";
import { applicationFingerprint } from "@/core/applications/fingerprint";
export const APPROVAL_TTL_MINUTES = 15;
function approvalSignature(
  approval: Omit<ApprovalSnapshot, "signature">,
  secret: string,
) {
  return createHmac("sha256", secret)
    .update(JSON.stringify(approval))
    .digest("hex");
}
export function createApprovalSnapshot(
  applicationId: string,
  version: number,
  value: ApplicationPackage,
  secret: string,
  now = Date.now(),
): ApprovalSnapshot {
  const approval = {
    applicationId,
    applicationVersion: version,
    fingerprint: applicationFingerprint(value),
    bidAmount: value.bidAmount,
    connectsCost: value.connectsCost ?? 0,
    boostConnects: value.boostConnects,
    expiresAt: new Date(now + APPROVAL_TTL_MINUTES * 60_000).toISOString(),
  };
  return { ...approval, signature: approvalSignature(approval, secret) };
}
export function assertValidApproval(
  approval: ApprovalSnapshot | null,
  applicationId: string,
  version: number,
  value: ApplicationPackage,
  secret: string,
  now = Date.now(),
) {
  if (
    !approval ||
    approval.applicationId !== applicationId ||
    approval.applicationVersion !== version ||
    approval.fingerprint !== applicationFingerprint(value)
  )
    throw new Error(
      "Explicit approval is required for this exact application version.",
    );
  if (Date.parse(approval.expiresAt) <= now)
    throw new Error(
      "Approval expired. Review the application and approve it again.",
    );
  const { signature, ...unsigned } = approval;
  const expected = approvalSignature(unsigned, secret);
  if (
    signature.length !== expected.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  )
    throw new Error("Approval integrity check failed. Approve it again.");
}
import { createHmac, timingSafeEqual } from "node:crypto";
