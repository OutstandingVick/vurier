import type { ApplicationState } from "@/core/applications/types";
const transitions: Record<ApplicationState, ApplicationState[]> = {
  draft: ["ready_for_review"],
  ready_for_review: ["draft", "approved"],
  approved: ["draft", "submitting"],
  submitting: ["submitted", "failed"],
  submitted: ["viewed", "interviewing", "hired", "rejected", "withdrawn"],
  failed: ["ready_for_review", "submitting"],
  viewed: ["interviewing", "hired", "rejected", "withdrawn"],
  interviewing: ["hired", "rejected", "withdrawn"],
  hired: [],
  rejected: [],
  withdrawn: [],
};
export function assertApplicationTransition(
  from: ApplicationState,
  to: ApplicationState,
) {
  if (!transitions[from].includes(to))
    throw new Error(`Invalid application transition from ${from} to ${to}.`);
}
