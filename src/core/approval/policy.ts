export const REQUIRES_EXPLICIT_APPROVAL = ["submit_proposal", "spend_connects"] as const;
export type GuardedAction = (typeof REQUIRES_EXPLICIT_APPROVAL)[number];

export type ApprovalRecord = {
  action: GuardedAction;
  resourceId: string;
  userId: string;
  approvedAt: Date;
};

export function assertApproval(record: ApprovalRecord | undefined, action: GuardedAction, resourceId: string) {
  if (!record || record.action !== action || record.resourceId !== resourceId) {
    throw new Error(`Explicit user approval is required to ${action.replace("_", " ")}.`);
  }
}
