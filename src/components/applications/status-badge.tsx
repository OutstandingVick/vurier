import type { ApplicationState } from "@/core/applications/types";
const labels: Record<ApplicationState, string> = {
  draft: "Draft",
  ready_for_review: "Pending approval",
  approved: "Approved",
  submitting: "Submitting",
  submitted: "Submitted",
  failed: "Failed",
  viewed: "Viewed",
  interviewing: "Interviewing",
  hired: "Hired",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};
export function ApplicationStatusBadge({
  status,
}: {
  status: ApplicationState;
}) {
  return (
    <span className="inline-flex rounded-full border bg-surface-muted px-2.5 py-1 text-xs font-semibold">
      {labels[status]}
    </span>
  );
}
