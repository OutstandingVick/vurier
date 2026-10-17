import type { ApplicationState } from "@/core/applications/types";
const providerMap: Record<string, ApplicationState> = {
  Accepted: "submitted",
  Activated: "interviewing",
  Declined: "rejected",
  Withdrawn: "withdrawn",
  Offered: "interviewing",
  Hired: "hired",
  Archived: "rejected",
  Pending: "submitting",
  Invalid: "failed",
};
export function mapUpworkStatus(status: string) {
  return providerMap[status] ?? null;
}
