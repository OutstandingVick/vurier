import type { ApplicationPackage } from "@/core/applications/types";
export function prepareApplicationPackage(input: {
  proposal: Record<string, unknown>;
  version: Record<string, unknown>;
  job: Record<string, unknown>;
  connectsCost?: number | null;
  boostConnects?: number;
}): ApplicationPackage {
  const bid = input.proposal.suggested_bid as {
    amount?: number;
    currency?: string;
  } | null;
  return {
    proposalId: String(input.proposal.id),
    proposalVersionId: String(input.version.id),
    jobId: String(input.job.id),
    coverLetter: String(input.version.cover_letter),
    bidAmount: bid?.amount ?? null,
    currency: bid?.currency ?? "USD",
    connectsCost: input.connectsCost ?? null,
    boostConnects: input.boostConnects ?? 0,
    milestones: Array.isArray(input.proposal.milestones)
      ? input.proposal.milestones
      : [],
    deliveryEstimate: input.proposal.estimated_timeline ?? null,
    screeningAnswers: Array.isArray(input.proposal.screening_answers)
      ? input.proposal.screening_answers
      : [],
    attachmentIds: Array.isArray(input.proposal.attachment_ids)
      ? (input.proposal.attachment_ids as string[])
      : [],
    directUrl:
      typeof input.job.source_url === "string" ? input.job.source_url : null,
    providerInput: null,
  };
}
