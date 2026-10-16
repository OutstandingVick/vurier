export const PROPOSAL_STAGES = ["evidence", "analysis", "strategy", "draft", "review", "saved"] as const;
export type ProposalStage = (typeof PROPOSAL_STAGES)[number];
export function canAdvanceProposal(from: ProposalStage, to: ProposalStage) { return PROPOSAL_STAGES.indexOf(to) === PROPOSAL_STAGES.indexOf(from) + 1; }
