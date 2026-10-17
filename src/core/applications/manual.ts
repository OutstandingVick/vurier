import type { ApplicationPackage } from "@/core/applications/types";
export function manualFallbackReason(
  value: ApplicationPackage,
  canSubmit: boolean,
) {
  if (!canSubmit)
    return "Upwork Submit Proposal permission is unavailable. Copy the reviewed package and apply manually on Upwork.";
  if (!value.providerInput)
    return "Required provider identifiers are unavailable. Apply manually rather than guessing submission fields.";
  return null;
}
