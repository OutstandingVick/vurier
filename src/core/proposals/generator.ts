export type ProposalDraft = { coverLetter: string; suggestedBid: number; estimatedDuration?: string };

export interface ProposalGenerator {
  createDraft(jobId: string, profileId: string): Promise<ProposalDraft>;
}

export type ApprovalGate = { approvedBy: string; approvedAt: Date };

export interface ProposalSubmissionGateway {
  submit(proposalId: string, approval: ApprovalGate): Promise<{ externalId: string }>;
}
