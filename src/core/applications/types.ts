export const APPLICATION_STATES = [
  "draft",
  "ready_for_review",
  "approved",
  "submitting",
  "submitted",
  "failed",
  "viewed",
  "interviewing",
  "hired",
  "rejected",
  "withdrawn",
] as const;
export type ApplicationState = (typeof APPLICATION_STATES)[number];
export type ApplicationPackage = {
  proposalId: string;
  proposalVersionId: string;
  jobId: string;
  coverLetter: string;
  bidAmount: number | null;
  currency: string;
  connectsCost: number | null;
  boostConnects: number;
  milestones: unknown[];
  deliveryEstimate: unknown;
  screeningAnswers: unknown[];
  attachmentIds: string[];
  directUrl: string | null;
  providerInput: Record<string, unknown> | null;
};
export type ApprovalSnapshot = {
  applicationId: string;
  applicationVersion: number;
  fingerprint: string;
  bidAmount: number | null;
  connectsCost: number;
  boostConnects: number;
  expiresAt: string;
  signature: string;
};
export type SpendingLimits = { daily: number; monthly: number };
export type ConnectsUsage = {
  daily: number;
  monthly: number;
  available: number | null;
};
export type SubmissionOutcome =
  | { kind: "submitted"; externalId: string }
  | { kind: "failed"; message: string; retryable: boolean }
  | { kind: "uncertain"; message: string }
  | { kind: "manual"; reason: string };
