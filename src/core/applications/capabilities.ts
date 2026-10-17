export const UPWORK_SUBMIT_PERMISSION = "Submit Proposal";
export const UPWORK_CONNECTS_PERMISSION =
  "Ad Credits and Connects Information - Read-Only Access";
export const UPWORK_PROPOSAL_STATUS_PERMISSION =
  "Client Proposals - Read And Write Access";
export function upworkCapabilities(scopes: string[]) {
  return {
    canSubmit: scopes.includes(UPWORK_SUBMIT_PERMISSION),
    canReadConnects: scopes.includes(UPWORK_CONNECTS_PERMISSION),
    canTrackStatus: scopes.includes(UPWORK_PROPOSAL_STATUS_PERMISSION),
  };
}
